import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PCMSOStatus, PCMSOVersion } from '@prisma/client';
import * as crypto from 'crypto';
import { ChangeDetectionResult, PCMSODiff } from '../exams.types';

/**
 * Serviço Gerador de PCMSO
 *
 * Responsabilidades principais:
 * - Detecção de mudanças no mapeamento (cargos, riscos, ambientes)
 * - Geração automática de rascunhos de PCMSO
 * - Versionamento Git-like (DRAFT → UNDER_REVIEW → SIGNED)
 * - Assinatura digital com SHA256
 * - Diff estruturado entre versões
 * - Invalidação automática quando mapeamento muda após assinatura
 */
@Injectable()
export class PCMSOGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Detectar mudanças no mapeamento desde a última versão assinada
   *
   * Compara o estado atual do mapeamento de uma empresa com a última
   * versão assinada do PCMSO para identificar o que mudou.
   */
  async detectChanges(companyId: string): Promise<ChangeDetectionResult> {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Empresa com ID "${companyId}" não encontrada`);
    }

    // Buscar última versão assinada
    const lastSignedVersion = await this.prisma.pCMSOVersion.findFirst({
      where: {
        companyId,
        status: PCMSOStatus.SIGNED,
      },
      orderBy: {
        versionNumber: 'desc',
      },
      include: {
        examRequirements: {
          include: {
            examination: true,
          },
        },
      },
    });

    const changes: ChangeDetectionResult['changes'] = [];
    const affectedJobs = new Set<string>();
    const affectedRisks = new Set<string>();

    // Se não há versão assinada, todas as regras atuais são "novas"
    if (!lastSignedVersion) {
      // Buscar todos os cargos ativos da empresa
      const currentJobs = await this.prisma.job.findMany({
        where: {
          companyId,
          active: true,
        },
      });

      // Buscar todos os riscos mapeados para cargos desta empresa
      const currentRisks = await this.prisma.risk.findMany({
        where: {
          jobRisks: {
            some: {
              job: {
                companyId,
              },
            },
          },
          active: true,
        },
      });

      if (currentJobs.length > 0) {
        changes.push({
          type: 'RULE_ADDED',
          description: `${currentJobs.length} cargo(s) configurado(s) (primeira versão do PCMSO)`,
        });
      }

      if (currentRisks.length > 0) {
        changes.push({
          type: 'RULE_ADDED',
          description: `${currentRisks.length} risco(s) mapeado(s) (primeira versão do PCMSO)`,
        });
      }

      return {
        hasChanges: currentJobs.length > 0 || currentRisks.length > 0,
        lastSignedVersion: null,
        changes,
        affectedJobs: currentJobs.map((j) => ({
          jobId: j.id,
          jobTitle: j.title,
          changeCount: 1,
        })),
        affectedRisks: currentRisks.map((r) => ({
          riskId: r.id,
          riskName: r.name,
          changeCount: 1,
        })),
      };
    }

    // Criar snapshot dos exames da última versão assinada
    const previousExamSnapshot = new Map<string, any>();
    for (const req of lastSignedVersion.examRequirements) {
      previousExamSnapshot.set(req.examId, req);
    }

    // Buscar estado atual dos exames consolidados para todos os cargos da empresa
    const currentJobs = await this.prisma.job.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        examRulesByJob: {
          where: { active: true },
          include: {
            examination: true,
          },
        },
        jobRisks: {
          include: {
            risk: {
              include: {
                examRulesByRisk: {
                  where: { active: true },
                  include: {
                    examination: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Criar snapshot dos exames atuais
    const currentExamSnapshot = new Map<string, any>();

    for (const job of currentJobs) {
      affectedJobs.add(job.id);

      // Adicionar exames das regras do cargo
      for (const jobRule of (job as any).examRulesByJob) {
        if (!currentExamSnapshot.has(jobRule.examId)) {
          currentExamSnapshot.set(jobRule.examId, {
            examId: jobRule.examId,
            examName: jobRule.examination.name,
            sources: [],
          });
        }
        currentExamSnapshot.get(jobRule.examId).sources.push({
          type: 'JOB',
          jobId: job.id,
          ruleId: jobRule.id,
        });
      }

      // Adicionar exames das regras dos riscos associados
      for (const assoc of (job as any).jobRisks) {
        affectedRisks.add(assoc.riskId);

        for (const riskRule of assoc.risk.examRulesByRisk) {
          if (!currentExamSnapshot.has(riskRule.examId)) {
            currentExamSnapshot.set(riskRule.examId, {
              examId: riskRule.examId,
              examName: riskRule.examination.name,
              sources: [],
            });
          }
          currentExamSnapshot.get(riskRule.examId).sources.push({
            type: 'RISK',
            riskId: assoc.riskId,
            ruleId: riskRule.id,
          });
        }
      }
    }

    // Comparar snapshots
    // 1. Exames adicionados
    for (const [examId, data] of currentExamSnapshot) {
      if (!previousExamSnapshot.has(examId)) {
        changes.push({
          type: 'EXAM_ADDED',
          description: `Exame adicionado: ${data.examName}`,
          affectedExamId: examId,
        });
      }
    }

    // 2. Exames removidos
    for (const [examId, data] of previousExamSnapshot) {
      if (!currentExamSnapshot.has(examId)) {
        changes.push({
          type: 'EXAM_REMOVED',
          description: `Exame removido: ${data.examination.name}`,
          affectedExamId: examId,
        });
      }
    }

    // 3. Periodicidade alterada (simplificado - comparação mais detalhada pode ser adicionada)
    for (const [examId, currentData] of currentExamSnapshot) {
      if (previousExamSnapshot.has(examId)) {
        const prevData = previousExamSnapshot.get(examId);
        // Comparação simplificada - na prática, comparar periodicityType e periodicityValue
        if (prevData.periodicityType !== currentData.periodicityType) {
          changes.push({
            type: 'PERIODICITY_CHANGED',
            description: `Periodicidade alterada para exame: ${currentData.examName}`,
            affectedExamId: examId,
          });
        }
      }
    }

    // Build affected jobs and risks with details
    const jobsList = await this.prisma.job.findMany({
      where: { id: { in: Array.from(affectedJobs) } },
      select: { id: true, title: true },
    });

    const risksList = await this.prisma.risk.findMany({
      where: { id: { in: Array.from(affectedRisks) } },
      select: { id: true, name: true },
    });

    return {
      hasChanges: changes.length > 0,
      lastSignedVersion: lastSignedVersion
        ? {
            id: lastSignedVersion.id,
            versionNumber: lastSignedVersion.versionNumber,
            signedAt: lastSignedVersion.signedAt!,
            signedByUserId: lastSignedVersion.signedByUserId!,
          }
        : null,
      changes,
      affectedJobs: jobsList.map((j) => ({
        jobId: j.id,
        jobTitle: j.title,
        changeCount: 1,
      })),
      affectedRisks: risksList.map((r) => ({
        riskId: r.id,
        riskName: r.name,
        changeCount: 1,
      })),
    };
  }

  /**
   * Gerar rascunho de PCMSO baseado no mapeamento atual
   *
   * Cria uma nova versão em status DRAFT consolidando todas as regras
   * de exames (por cargo e por risco) para a empresa.
   */
  async generateDraft(
    companyId: string,
    userId: string,
    options?: {
      title?: string;
      useAI?: boolean;
      aiModel?: string;
    },
  ): Promise<PCMSOVersion> {
    // Detectar mudanças primeiro
    const changeDetection = await this.detectChanges(companyId);

    // Buscar última versão (qualquer status) para determinar o número da próxima versão
    const lastVersion = await this.prisma.pCMSOVersion.findFirst({
      where: { companyId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    // Buscar empresa
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    // Buscar jobs separadamente com dados completos
    const jobs = await this.prisma.job.findMany({
      where: { companyId, active: true },
      include: {
        examRulesByJob: {
          where: { active: true },
          include: {
            examination: true,
          },
        },
        jobRisks: {
          include: {
            risk: {
              include: {
                examRulesByRisk: {
                  where: { active: true },
                  include: {
                    examination: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Gerar HTML do PCMSO (simplificado - pode ser expandido)
    const contentHtml = this.generatePCMSOHTML(company!, jobs, changeDetection);

    // Criar nova versão em DRAFT
    const newVersion = await this.prisma.pCMSOVersion.create({
      data: {
        companyId,
        versionNumber: nextVersionNumber,
        status: PCMSOStatus.DRAFT,
        title: options?.title || `PCMSO ${company!.tradeName} - Versão ${nextVersionNumber}`,
        contentHtml,
        generatedByAI: options?.useAI ?? false,
        aiModel: options?.aiModel,
        mappingChangedAfterSign: false,
        diffFromPrevious: changeDetection.lastSignedVersion
          ? this.generateDiffJSON(changeDetection)
          : null,
      },
    });

    // Criar requisitos de exame vinculados a esta versão
    const examRequirementsData: any[] = [];

    for (const job of jobs) {
      // Processar regras do cargo
      for (const jobRule of (job as any).examRulesByJob) {
        examRequirementsData.push({
          pcmsoVersionId: newVersion.id,
          examId: jobRule.examId,
          source: 'JOB',
          sourceJobId: jobRule.id,
          periodicityType: jobRule.periodicityType,
          periodicityValue: jobRule.periodicityValue,
          periodicityAdvancedRule: jobRule.periodicityAdvancedRule,
        });
      }

      // Processar regras dos riscos (evitar duplicatas se jobRule tem overrideRiskRules)
      for (const assoc of (job as any).jobRisks) {
        for (const riskRule of assoc.risk.examRulesByRisk) {
          // Verificar se já existe regra do cargo que sobrescreve
          const overriddenByJob = (job as any).examRulesByJob.find(
            (jr) => jr.examId === riskRule.examId && jr.overrideRiskRules,
          );

          if (!overriddenByJob) {
            examRequirementsData.push({
              pcmsoVersionId: newVersion.id,
              examId: riskRule.examId,
              source: 'RISK',
              sourceRiskId: riskRule.id,
              periodicityType: riskRule.periodicityType,
              periodicityValue: riskRule.periodicityValue,
              periodicityAdvancedRule: riskRule.periodicityAdvancedRule,
            });
          }
        }
      }
    }

    // Criar todos os requisitos de exame
    if (examRequirementsData.length > 0) {
      await this.prisma.pCMSOExamRequirement.createMany({
        data: examRequirementsData,
      });
    }

    return this.prisma.pCMSOVersion.findUnique({
      where: { id: newVersion.id },
      include: {
        examRequirements: {
          include: {
            examination: true,
          },
        },
        company: {
          select: {
            id: true,
            tradeName: true,
            corporateName: true,
            cnpj: true,
          },
        },
      },
    }) as Promise<PCMSOVersion>;
  }

  /**
   * Assinar uma versão de PCMSO
   *
   * Move status de DRAFT/UNDER_REVIEW para SIGNED e gera hash SHA256.
   * Torna a versão imutável.
   */
  async signVersion(
    versionId: string,
    userId: string,
  ): Promise<PCMSOVersion> {
    const version = await this.prisma.pCMSOVersion.findUnique({
      where: { id: versionId },
      include: {
        examRequirements: true,
      },
    });

    if (!version) {
      throw new NotFoundException(`Versão de PCMSO com ID "${versionId}" não encontrada`);
    }

    if (version.status === PCMSOStatus.SIGNED) {
      throw new BadRequestException('Esta versão já está assinada e é imutável');
    }

    if (version.status === PCMSOStatus.ARCHIVED || version.status === PCMSOStatus.OUTDATED) {
      throw new BadRequestException(
        `Não é possível assinar uma versão com status "${version.status}"`,
      );
    }

    // Gerar hash SHA256 do conteúdo
    const contentForHash = JSON.stringify({
      versionNumber: version.versionNumber,
      title: version.title,
      contentHtml: version.contentHtml,
      examRequirements: version.examRequirements.map((req) => ({
        examId: req.examId,
        source: req.source,
        periodicityType: req.periodicityType,
        periodicityValue: req.periodicityValue,
      })),
    });

    const signatureHash = crypto.createHash('sha256').update(contentForHash).digest('hex');

    // Atualizar versão
    return this.prisma.pCMSOVersion.update({
      where: { id: versionId },
      data: {
        status: PCMSOStatus.SIGNED,
        signedAt: new Date(),
        signedByUserId: userId,
        signatureHash,
      },
      include: {
        company: {
          select: {
            id: true,
            tradeName: true,
            corporateName: true,
            cnpj: true,
          },
        },
        examRequirements: {
          include: {
            examination: true,
          },
        },
      },
    });
  }

  /**
   * Obter diff estruturado entre duas versões
   */
  async getDiff(fromVersionId: string, toVersionId: string): Promise<PCMSODiff> {
    const fromVersion = await this.prisma.pCMSOVersion.findUnique({
      where: { id: fromVersionId },
      include: {
        examRequirements: {
          include: {
            examination: true,
          },
        },
      },
    });

    const toVersion = await this.prisma.pCMSOVersion.findUnique({
      where: { id: toVersionId },
      include: {
        examRequirements: {
          include: {
            examination: true,
          },
        },
      },
    });

    if (!fromVersion || !toVersion) {
      throw new NotFoundException('Uma ou ambas as versões não foram encontradas');
    }

    if (fromVersion.companyId !== toVersion.companyId) {
      throw new BadRequestException('As versões devem ser da mesma empresa');
    }

    // Mapas de exames
    const fromExams = new Map(
      fromVersion.examRequirements.map((req) => [req.examId, req]),
    );
    const toExams = new Map(toVersion.examRequirements.map((req) => [req.examId, req]));

    // Exames adicionados
    const examsAdded = [];
    for (const [examId, req] of toExams) {
      if (!fromExams.has(examId)) {
        examsAdded.push({
          id: examId,
          name: req.examination.name,
          sourceType: req.source,
          periodicityType: req.periodicityType,
          periodicityValue: req.periodicityValue,
        });
      }
    }

    // Exames removidos
    const examsRemoved = [];
    for (const [examId, req] of fromExams) {
      if (!toExams.has(examId)) {
        examsRemoved.push({
          id: examId,
          name: req.examination.name,
          sourceType: req.source,
        });
      }
    }

    // Exames modificados (periodicidade alterada)
    const examsModified = [];
    for (const [examId, toReq] of toExams) {
      const fromReq = fromExams.get(examId);
      if (
        fromReq &&
        (fromReq.periodicityType !== toReq.periodicityType ||
          fromReq.periodicityValue !== toReq.periodicityValue)
      ) {
        examsModified.push({
          id: examId,
          name: toReq.examination.name,
          oldPeriodicity: {
            type: fromReq.periodicityType,
            value: fromReq.periodicityValue,
          },
          newPeriodicity: {
            type: toReq.periodicityType,
            value: toReq.periodicityValue,
          },
        });
      }
    }

    return {
      fromVersion: fromVersion.versionNumber,
      toVersion: toVersion.versionNumber,
      examsAdded,
      examsRemoved,
      examsModified,
      rulesAdded: examsAdded.length,
      rulesRemoved: examsRemoved.length,
      rulesModified: examsModified.length,
    };
  }

  /**
   * Marcar versões anteriores como OUTDATED quando uma nova versão é assinada
   */
  async markPreviousVersionsAsOutdated(companyId: string, currentVersionNumber: number): Promise<void> {
    await this.prisma.pCMSOVersion.updateMany({
      where: {
        companyId,
        versionNumber: {
          lt: currentVersionNumber,
        },
        status: PCMSOStatus.SIGNED,
      },
      data: {
        status: PCMSOStatus.OUTDATED,
      },
    });
  }

  /**
   * Gerar HTML simplificado do PCMSO
   */
  private generatePCMSOHTML(company: any, jobs: any[], changeDetection: ChangeDetectionResult): string {
    let html = `
      <h1>PCMSO - ${company.tradeName}</h1>
      <h2>Programa de Controle Médico de Saúde Ocupacional</h2>

      <div class="company-info">
        <p><strong>Razão Social:</strong> ${company.corporateName}</p>
        <p><strong>CNPJ:</strong> ${company.cnpj}</p>
        <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <h3>Cargos e Exames Ocupacionais</h3>
      <table>
        <thead>
          <tr>
            <th>Cargo</th>
            <th>Exames Obrigatórios</th>
            <th>Periodicidade</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const job of jobs) {
      const allExams = new Set();

      // Coletar exames do cargo
      job.examRulesByJob.forEach((rule: any) => {
        allExams.add(rule.examination.name);
      });

      // Coletar exames dos riscos
      job.jobRisks.forEach((assoc: any) => {
        assoc.risk.examRulesByRisk.forEach((rule: any) => {
          allExams.add(rule.examination.name);
        });
      });

      html += `
        <tr>
          <td>${job.title}</td>
          <td>${Array.from(allExams).join(', ') || 'Nenhum'}</td>
          <td>Conforme NR-7</td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>

      <h3>Observações</h3>
      <p>Este documento foi gerado automaticamente baseado no mapeamento de riscos e exames configurado no sistema.</p>
    `;

    return html;
  }

  /**
   * Gerar JSON de diff para armazenamento
   */
  private generateDiffJSON(changeDetection: ChangeDetectionResult): any {
    return {
      hasChanges: changeDetection.hasChanges,
      changes: changeDetection.changes,
      affectedJobs: changeDetection.affectedJobs,
      affectedRisks: changeDetection.affectedRisks,
      detectedAt: new Date().toISOString(),
    };
  }
}
