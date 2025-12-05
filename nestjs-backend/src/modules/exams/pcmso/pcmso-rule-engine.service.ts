import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Serviço Motor de Regras NR-7
 *
 * Responsabilidades:
 * - Validar conformidade com NR-7
 * - Verificar exames obrigatórios por tipo de risco
 * - Validar periodicidades mínimas
 * - Gerar alertas e warnings de conformidade
 */
@Injectable()
export class PCMSORuleEngineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validar conformidade NR-7 para um PCMSO draft
   */
  async validateNR7Compliance(pcmsoVersionId: string): Promise<{
    isCompliant: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const version = await this.prisma.pCMSOVersion.findUnique({
      where: { id: pcmsoVersionId },
      include: {
        examRequirements: {
          include: {
            examination: true,
          },
        },
      },
    });

    if (!version) {
      throw new Error('Versão de PCMSO não encontrada');
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Buscar examRequirements separadamente
    const examRequirements = await this.prisma.pCMSOExamRequirement.findMany({
      where: { pcmsoVersionId: version.id },
      include: { examination: true },
    });

    const examMap = new Map(
      examRequirements.map((req) => [req.examination.name.toLowerCase(), req]),
    );

    // Buscar jobs separadamente
    const jobs = await this.prisma.job.findMany({
      where: { companyId: version.companyId, active: true },
      include: {
        jobRisks: {
          include: { risk: true },
        },
      },
    });

    // Validar exames obrigatórios por tipo de risco
    for (const job of jobs) {
      for (const assoc of (job as any).jobRisks) {
        const risk = assoc.risk;
        const riskNameLower = risk.name.toLowerCase();

        // Ruído → Audiometria obrigatória
        if (riskNameLower.includes('ruído') && riskNameLower.includes('85')) {
          if (!examMap.has('audiometria tonal') && !examMap.has('audiometria')) {
            errors.push(
              `NR-7: Cargo "${job.title}" exposto a ruído acima de 85 dB(A) requer Audiometria Tonal obrigatória`,
            );
          }
        }

        // Poeiras minerais → Espirometria + Raio-X
        if (riskNameLower.includes('sílica') || riskNameLower.includes('asbesto')) {
          if (!examMap.has('espirometria')) {
            errors.push(
              `NR-7: Cargo "${job.title}" exposto a poeiras minerais requer Espirometria obrigatória`,
            );
          }
          if (!examMap.has('raio-x de tórax') && !examMap.has('raio-x')) {
            warnings.push(
              `NR-7: Cargo "${job.title}" exposto a poeiras minerais deveria ter Raio-X de Tórax`,
            );
          }
        }

        // Benzeno → Exame específico
        if (riskNameLower.includes('benzeno')) {
          if (!examMap.has('benzeno') && !examMap.has('ácido trans-trans-mucônico')) {
            errors.push(
              `NR-7: Cargo "${job.title}" exposto a benzeno requer exame de Ácido trans-trans-Mucônico obrigatório`,
            );
          }
        }

        // Chumbo → Plumbemia
        if (riskNameLower.includes('chumbo')) {
          if (!examMap.has('chumbo no sangue') && !examMap.has('plumbemia')) {
            errors.push(
              `NR-7: Cargo "${job.title}" exposto a chumbo requer Plumbemia obrigatória`,
            );
          }
        }
      }
    }

    // Recomendações gerais
    if (!examMap.has('exame clínico ocupacional') && !examMap.has('exame clínico')) {
      warnings.push(
        'NR-7: Recomenda-se incluir Exame Clínico Ocupacional para todos os trabalhadores',
      );
    }

    const isCompliant = errors.length === 0;

    return {
      isCompliant,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Sugerir exames adicionais com base em análise de riscos
   */
  async suggestAdditionalExams(pcmsoVersionId: string): Promise<{
    suggestions: Array<{
      examName: string;
      reason: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }> {
    // Implementação simplificada - pode ser expandida com AI
    return {
      suggestions: [],
    };
  }
}
