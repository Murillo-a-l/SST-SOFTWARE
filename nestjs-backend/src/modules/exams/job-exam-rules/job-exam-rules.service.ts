import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJobExamRuleDto } from './dto/create-job-exam-rule.dto';
import { UpdateJobExamRuleDto } from './dto/update-job-exam-rule.dto';
import { JobExamRuleFiltersDto } from './dto/job-exam-rule-filters.dto';
import { ExamRuleByJob, PeriodicityType } from '@prisma/client';

/**
 * Serviço de Gestão de Regras de Exames por Cargo
 *
 * Responsabilidades:
 * - CRUD completo de regras cargo-exame
 * - Validação de periodicidade (simples e avançada)
 * - Detecção de conflitos (mesma combinação cargo+exame)
 * - Consolidação de regras (cargo + riscos associados)
 * - Sugestões de regras via AI
 * - Verificação de dependências antes de excluir
 */
@Injectable()
export class JobExamRulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar nova regra de exame por cargo
   */
  async create(createJobExamRuleDto: CreateJobExamRuleDto): Promise<ExamRuleByJob> {
    // Verificar se cargo existe
    const job = await this.prisma.job.findUnique({
      where: { id: createJobExamRuleDto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Cargo com ID "${createJobExamRuleDto.jobId}" não encontrado`);
    }

    // Verificar se exame existe
    const examination = await this.prisma.examination.findUnique({
      where: { id: createJobExamRuleDto.examId },
    });

    if (!examination) {
      throw new NotFoundException(`Exame com ID "${createJobExamRuleDto.examId}" não encontrado`);
    }

    // Verificar se já existe regra para esta combinação
    const existingRule = await this.prisma.examRuleByJob.findUnique({
      where: {
        jobId_examId: {
          jobId: createJobExamRuleDto.jobId,
          examId: createJobExamRuleDto.examId,
        },
      },
    });

    if (existingRule) {
      throw new ConflictException(
        `Já existe uma regra vinculando o cargo "${job.title}" ao exame "${examination.name}". ` +
          `Se desejar alterar, use a operação de atualização.`,
      );
    }

    // Validar periodicidade
    this.validatePeriodicity(
      createJobExamRuleDto.periodicityType,
      createJobExamRuleDto.periodicityValue,
      createJobExamRuleDto.periodicityAdvancedRule,
    );

    // Criar regra
    return this.prisma.examRuleByJob.create({
      data: {
        jobId: createJobExamRuleDto.jobId,
        examId: createJobExamRuleDto.examId,
        periodicityType: createJobExamRuleDto.periodicityType,
        periodicityValue: createJobExamRuleDto.periodicityValue,
        periodicityAdvancedRule: (createJobExamRuleDto.periodicityAdvancedRule as any) || null,
        applicableOnAdmission: createJobExamRuleDto.applicableOnAdmission ?? false,
        applicableOnDismissal: createJobExamRuleDto.applicableOnDismissal ?? false,
        applicableOnReturn: createJobExamRuleDto.applicableOnReturn ?? false,
        applicableOnChange: createJobExamRuleDto.applicableOnChange ?? false,
        applicablePeriodic: createJobExamRuleDto.applicablePeriodic ?? false,
        overrideRiskRules: createJobExamRuleDto.overrideRiskRules ?? false,
        justification: createJobExamRuleDto.justification,
        aiRecommendation: createJobExamRuleDto.aiRecommendation,
        notes: createJobExamRuleDto.notes,
        active: createJobExamRuleDto.active ?? true,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
          },
        },
        examination: {
          select: {
            id: true,
            name: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });
  }

  /**
   * Listar regras com filtros opcionais
   */
  async findAll(filters?: JobExamRuleFiltersDto): Promise<ExamRuleByJob[]> {
    const where: any = {};

    if (filters) {
      if (filters.jobId) {
        where.jobId = filters.jobId;
      }

      if (filters.examId) {
        where.examId = filters.examId;
      }

      if (filters.active !== undefined) {
        where.active = filters.active;
      }

      if (filters.periodicityType) {
        where.periodicityType = filters.periodicityType;
      }

      if (filters.overrideRiskRules !== undefined) {
        where.overrideRiskRules = filters.overrideRiskRules;
      }
    }

    return this.prisma.examRuleByJob.findMany({
      where,
      orderBy: [
        { job: { title: 'asc' } },
        { examination: { name: 'asc' } },
      ],
      include: {
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
          },
        },
        examination: {
          select: {
            id: true,
            name: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });
  }

  /**
   * Buscar regra por ID
   */
  async findOne(id: string): Promise<ExamRuleByJob> {
    const rule = await this.prisma.examRuleByJob.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            cbo: true,
          },
        },
        examination: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException(`Regra de exame por cargo com ID "${id}" não encontrada`);
    }

    return rule;
  }

  /**
   * Atualizar regra existente
   */
  async update(id: string, updateJobExamRuleDto: UpdateJobExamRuleDto): Promise<ExamRuleByJob> {
    // Verificar se regra existe
    await this.findOne(id);

    // Validar periodicidade se estiver sendo atualizada
    if (
      updateJobExamRuleDto.periodicityType !== undefined ||
      updateJobExamRuleDto.periodicityValue !== undefined ||
      updateJobExamRuleDto.periodicityAdvancedRule !== undefined
    ) {
      const currentRule = await this.prisma.examRuleByJob.findUnique({
        where: { id },
      });

      const periodicityType =
        updateJobExamRuleDto.periodicityType ?? currentRule!.periodicityType;
      const periodicityValue =
        updateJobExamRuleDto.periodicityValue ?? currentRule!.periodicityValue;
      const periodicityAdvancedRule =
        updateJobExamRuleDto.periodicityAdvancedRule ?? currentRule!.periodicityAdvancedRule;

      this.validatePeriodicity(periodicityType, periodicityValue, periodicityAdvancedRule);
    }

    return this.prisma.examRuleByJob.update({
      where: { id },
      data: {
        ...updateJobExamRuleDto,
        periodicityAdvancedRule: updateJobExamRuleDto.periodicityAdvancedRule as any,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
          },
        },
        examination: {
          select: {
            id: true,
            name: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });
  }

  /**
   * Excluir regra (soft delete)
   */
  async remove(id: string): Promise<void> {
    // Verificar se regra existe
    const rule = await this.findOne(id);

    // Verificar se a regra está sendo usada em algum PCMSO
    const usageCount = await this.prisma.pCMSOExamRequirement.count({
      where: {
        sourceJobId: id,
        pcmsoVersion: {
          status: {
            in: ['SIGNED', 'UNDER_REVIEW'],
          },
        },
      },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Não é possível excluir a regra pois ela está sendo utilizada em ${usageCount} versão(ões) de PCMSO ativa(s). ` +
          `Desative a regra ao invés de excluí-la.`,
      );
    }

    // Soft delete: marcar como inativa
    await this.prisma.examRuleByJob.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Buscar todas as regras de um cargo específico
   */
  async findByJob(jobId: string): Promise<ExamRuleByJob[]> {
    // Verificar se cargo existe
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Cargo com ID "${jobId}" não encontrado`);
    }

    return this.prisma.examRuleByJob.findMany({
      where: {
        jobId,
        active: true,
      },
      orderBy: {
        examination: { name: 'asc' },
      },
      include: {
        examination: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });
  }

  /**
   * Consolidar exames para um cargo
   *
   * Retorna a lista consolidada de exames considerando:
   * 1. Regras específicas do cargo (ExamRuleByJob)
   * 2. Regras dos riscos associados ao cargo (via JobRiskAssociation → ExamRuleByRisk)
   *
   * Lógica:
   * - Se a regra do cargo tem overrideRiskRules = true, ela prevalece sobre regras de risco para aquele exame
   * - Caso contrário, ambas as regras são consideradas (união)
   */
  async consolidateExamsForJob(jobId: string): Promise<{
    jobRules: any[];
    riskRules: any[];
    consolidated: any[];
    overrides: any[];
  }> {
    // Verificar se cargo existe
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobRisks: {
          include: {
            risk: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Cargo com ID "${jobId}" não encontrado`);
    }

    // 1. Buscar regras específicas do cargo
    const jobRules = await this.prisma.examRuleByJob.findMany({
      where: {
        jobId,
        active: true,
      },
      include: {
        examination: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });

    // 2. Buscar riscos associados ao cargo
    const riskIds = (job as any).jobRisks.map((assoc: any) => assoc.riskId);

    // 3. Buscar regras de exames desses riscos
    const riskRules = await this.prisma.examRuleByRisk.findMany({
      where: {
        riskId: { in: riskIds },
        active: true,
      },
      include: {
        risk: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        examination: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            table27Codes: true,
          },
        },
      },
    });

    // 4. Consolidar regras
    const examMap = new Map<string, any>();
    const overrides: any[] = [];

    // Primeiro, adicionar regras de risco
    for (const riskRule of riskRules) {
      const examId = riskRule.examId;
      if (!examMap.has(examId)) {
        examMap.set(examId, {
          examId,
          examination: riskRule.examination,
          sources: [],
        });
      }

      examMap.get(examId).sources.push({
        type: 'RISK',
        riskId: riskRule.riskId,
        riskName: riskRule.risk.name,
        ruleId: riskRule.id,
        periodicityType: riskRule.periodicityType,
        periodicityValue: riskRule.periodicityValue,
        periodicityAdvancedRule: riskRule.periodicityAdvancedRule,
        applicableOnAdmission: riskRule.applicableOnAdmission,
        applicableOnDismissal: riskRule.applicableOnDismissal,
        applicableOnReturn: riskRule.applicableOnReturn,
        applicableOnChange: riskRule.applicableOnChange,
        applicablePeriodic: riskRule.applicablePeriodic,
      });
    }

    // Depois, processar regras do cargo (podem sobrescrever)
    for (const jobRule of jobRules) {
      const examId = jobRule.examId;

      if (!examMap.has(examId)) {
        examMap.set(examId, {
          examId,
          examination: jobRule.examination,
          sources: [],
        });
      }

      // Se a regra do cargo sobrescreve regras de risco
      if (jobRule.overrideRiskRules) {
        // Remover regras de risco para este exame
        const existingSources = examMap.get(examId).sources;
        const overriddenRiskRules = existingSources.filter((s: any) => s.type === 'RISK');

        if (overriddenRiskRules.length > 0) {
          overrides.push({
            examId,
            examName: jobRule.examination.name,
            jobRuleId: jobRule.id,
            overriddenRiskRules: overriddenRiskRules.map((r: any) => ({
              riskId: r.riskId,
              riskName: r.riskName,
              ruleId: r.ruleId,
            })),
          });
        }

        // Limpar sources e adicionar apenas a regra do cargo
        examMap.get(examId).sources = [];
      }

      // Adicionar regra do cargo
      examMap.get(examId).sources.push({
        type: 'JOB',
        jobId: jobRule.jobId,
        ruleId: jobRule.id,
        periodicityType: jobRule.periodicityType,
        periodicityValue: jobRule.periodicityValue,
        periodicityAdvancedRule: jobRule.periodicityAdvancedRule,
        applicableOnAdmission: jobRule.applicableOnAdmission,
        applicableOnDismissal: jobRule.applicableOnDismissal,
        applicableOnReturn: jobRule.applicableOnReturn,
        applicableOnChange: jobRule.applicableOnChange,
        applicablePeriodic: jobRule.applicablePeriodic,
        overrideRiskRules: jobRule.overrideRiskRules,
      });
    }

    // Converter map para array
    const consolidated = Array.from(examMap.values());

    return {
      jobRules: jobRules.map((r) => ({
        id: r.id,
        examId: r.examId,
        examName: r.examination.name,
        periodicityType: r.periodicityType,
        periodicityValue: r.periodicityValue,
        overrideRiskRules: r.overrideRiskRules,
      })),
      riskRules: riskRules.map((r) => ({
        id: r.id,
        riskId: r.riskId,
        riskName: r.risk.name,
        examId: r.examId,
        examName: r.examination.name,
        periodicityType: r.periodicityType,
        periodicityValue: r.periodicityValue,
      })),
      consolidated,
      overrides,
    };
  }

  /**
   * Validar periodicidade
   */
  private validatePeriodicity(
    type: PeriodicityType,
    value?: number | null,
    advancedRule?: any,
  ): void {
    // Se for PERIODIC, deve ter value OU advancedRule
    if (type === PeriodicityType.PERIODIC) {
      if (!value && !advancedRule) {
        throw new BadRequestException(
          'Para periodicidade PERIODIC, é necessário fornecer "periodicityValue" ou "periodicityAdvancedRule"',
        );
      }

      if (value && (value < 1 || value > 120)) {
        throw new BadRequestException(
          'O valor de periodicidade deve estar entre 1 e 120 meses',
        );
      }
    }

    // Se for CUSTOM, deve ter advancedRule
    if (type === PeriodicityType.CUSTOM) {
      if (!advancedRule) {
        throw new BadRequestException(
          'Para periodicidade CUSTOM, é necessário fornecer "periodicityAdvancedRule"',
        );
      }
    }

    // Validar estrutura de advancedRule se fornecido
    if (advancedRule) {
      if (!advancedRule.type || !advancedRule.conditions || !Array.isArray(advancedRule.conditions)) {
        throw new BadRequestException(
          'A regra avançada de periodicidade deve conter "type" e "conditions" (array)',
        );
      }

      if (!advancedRule.defaultPeriodicityMonths) {
        throw new BadRequestException(
          'A regra avançada deve conter "defaultPeriodicityMonths"',
        );
      }
    }
  }
}
