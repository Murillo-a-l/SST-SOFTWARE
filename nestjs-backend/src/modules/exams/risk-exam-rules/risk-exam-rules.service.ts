import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRiskExamRuleDto } from './dto/create-risk-exam-rule.dto';
import { UpdateRiskExamRuleDto } from './dto/update-risk-exam-rule.dto';
import { RiskExamRuleFiltersDto } from './dto/risk-exam-rule-filters.dto';
import { ExamRuleByRisk, PeriodicityType } from '@prisma/client';

/**
 * Serviço de Gestão de Regras de Exames por Risco
 *
 * Responsabilidades:
 * - CRUD completo de regras risco-exame
 * - Validação de periodicidade (simples e avançada)
 * - Detecção de conflitos (mesma combinação risco+exame)
 * - Sugestões de regras via AI
 * - Verificação de dependências antes de excluir
 */
@Injectable()
export class RiskExamRulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar nova regra de exame por risco
   */
  async create(createRiskExamRuleDto: CreateRiskExamRuleDto): Promise<ExamRuleByRisk> {
    // Verificar se risco existe
    const risk = await this.prisma.risk.findUnique({
      where: { id: createRiskExamRuleDto.riskId },
    });

    if (!risk) {
      throw new NotFoundException(`Risco com ID "${createRiskExamRuleDto.riskId}" não encontrado`);
    }

    // Verificar se exame existe
    const examination = await this.prisma.examination.findUnique({
      where: { id: createRiskExamRuleDto.examId },
    });

    if (!examination) {
      throw new NotFoundException(`Exame com ID "${createRiskExamRuleDto.examId}" não encontrado`);
    }

    // Verificar se já existe regra para esta combinação
    const existingRule = await this.prisma.examRuleByRisk.findUnique({
      where: {
        riskId_examId: {
          riskId: createRiskExamRuleDto.riskId,
          examId: createRiskExamRuleDto.examId,
        },
      },
    });

    if (existingRule) {
      throw new ConflictException(
        `Já existe uma regra vinculando o risco "${risk.name}" ao exame "${examination.name}". ` +
          `Se desejar alterar, use a operação de atualização.`,
      );
    }

    // Validar periodicidade
    this.validatePeriodicity(
      createRiskExamRuleDto.periodicityType,
      createRiskExamRuleDto.periodicityValue,
      createRiskExamRuleDto.periodicityAdvancedRule,
    );

    // Criar regra
    return this.prisma.examRuleByRisk.create({
      data: {
        riskId: createRiskExamRuleDto.riskId,
        examId: createRiskExamRuleDto.examId,
        periodicityType: createRiskExamRuleDto.periodicityType,
        periodicityValue: createRiskExamRuleDto.periodicityValue,
        periodicityAdvancedRule: (createRiskExamRuleDto.periodicityAdvancedRule as any) || null,
        applicableOnAdmission: createRiskExamRuleDto.applicableOnAdmission ?? false,
        applicableOnDismissal: createRiskExamRuleDto.applicableOnDismissal ?? false,
        applicableOnReturn: createRiskExamRuleDto.applicableOnReturn ?? false,
        applicableOnChange: createRiskExamRuleDto.applicableOnChange ?? false,
        applicablePeriodic: createRiskExamRuleDto.applicablePeriodic ?? false,
        justification: createRiskExamRuleDto.justification,
        aiRecommendation: createRiskExamRuleDto.aiRecommendation,
        notes: createRiskExamRuleDto.notes,
        active: createRiskExamRuleDto.active ?? true,
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
  async findAll(filters?: RiskExamRuleFiltersDto): Promise<ExamRuleByRisk[]> {
    const where: any = {};

    if (filters) {
      if (filters.riskId) {
        where.riskId = filters.riskId;
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

      if (filters.riskType) {
        where.risk = {
          type: filters.riskType,
        };
      }
    }

    return this.prisma.examRuleByRisk.findMany({
      where,
      orderBy: [
        { risk: { name: 'asc' } },
        { examination: { name: 'asc' } },
      ],
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
  async findOne(id: string): Promise<ExamRuleByRisk> {
    const rule = await this.prisma.examRuleByRisk.findUnique({
      where: { id },
      include: {
        risk: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
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
      throw new NotFoundException(`Regra de exame por risco com ID "${id}" não encontrada`);
    }

    return rule;
  }

  /**
   * Atualizar regra existente
   */
  async update(id: string, updateRiskExamRuleDto: UpdateRiskExamRuleDto): Promise<ExamRuleByRisk> {
    // Verificar se regra existe
    await this.findOne(id);

    // Validar periodicidade se estiver sendo atualizada
    if (
      updateRiskExamRuleDto.periodicityType !== undefined ||
      updateRiskExamRuleDto.periodicityValue !== undefined ||
      updateRiskExamRuleDto.periodicityAdvancedRule !== undefined
    ) {
      const currentRule = await this.prisma.examRuleByRisk.findUnique({
        where: { id },
      });

      const periodicityType =
        updateRiskExamRuleDto.periodicityType ?? currentRule!.periodicityType;
      const periodicityValue =
        updateRiskExamRuleDto.periodicityValue ?? currentRule!.periodicityValue;
      const periodicityAdvancedRule =
        updateRiskExamRuleDto.periodicityAdvancedRule ?? currentRule!.periodicityAdvancedRule;

      this.validatePeriodicity(periodicityType, periodicityValue, periodicityAdvancedRule);
    }

    return this.prisma.examRuleByRisk.update({
      where: { id },
      data: {
        ...updateRiskExamRuleDto,
        periodicityAdvancedRule: updateRiskExamRuleDto.periodicityAdvancedRule as any,
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
        sourceRiskId: id,
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
    await this.prisma.examRuleByRisk.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Buscar todas as regras de um risco específico
   */
  async findByRisk(riskId: string): Promise<ExamRuleByRisk[]> {
    // Verificar se risco existe
    const risk = await this.prisma.risk.findUnique({
      where: { id: riskId },
    });

    if (!risk) {
      throw new NotFoundException(`Risco com ID "${riskId}" não encontrado`);
    }

    return this.prisma.examRuleByRisk.findMany({
      where: {
        riskId,
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
   * Sugerir exames para um risco baseado em regras da NR-7 e boas práticas
   *
   * Esta é uma sugestão estática baseada no tipo de risco.
   * A IA pode ser integrada posteriormente para sugestões mais inteligentes.
   */
  async suggestExamsForRisk(riskId: string): Promise<{
    suggestions: Array<{
      examId: string;
      examName: string;
      category: string;
      periodicityType: PeriodicityType;
      periodicityValue?: number;
      reasoning: string;
    }>;
  }> {
    // Verificar se risco existe
    const risk = await this.prisma.risk.findUnique({
      where: { id: riskId },
    });

    if (!risk) {
      throw new NotFoundException(`Risco com ID "${riskId}" não encontrado`);
    }

    // Buscar exames já vinculados
    const existingRules = await this.prisma.examRuleByRisk.findMany({
      where: { riskId },
      select: { examId: true },
    });

    const existingExamIds = new Set(existingRules.map((r) => r.examId));

    // Lógica de sugestão baseada no tipo e nome do risco
    const suggestions: any[] = [];

    const riskNameLower = risk.name.toLowerCase();
    const riskType = risk.type;

    // Buscar exames disponíveis
    const allExams = await this.prisma.examination.findMany({
      where: { active: true },
    });

    // Regras de sugestão baseadas em NR-7
    for (const exam of allExams) {
      if (existingExamIds.has(exam.id)) continue; // Já existe regra

      let shouldSuggest = false;
      let reasoning = '';
      let periodicityType: PeriodicityType = PeriodicityType.PERIODIC;
      let periodicityValue: number | undefined = 12;

      // Ruído → Audiometria
      if (riskNameLower.includes('ruído') && exam.name.includes('Audiometria')) {
        shouldSuggest = true;
        reasoning = 'NR-7: Audiometria obrigatória para exposição a ruído acima de 85 dB(A)';
        periodicityValue = 12; // Anual
      }

      // Poeiras/Gases → Espirometria
      if (
        (riskNameLower.includes('poeira') ||
          riskNameLower.includes('gás') ||
          riskNameLower.includes('vapor')) &&
        exam.name.includes('Espirometria')
      ) {
        shouldSuggest = true;
        reasoning = 'NR-7: Espirometria obrigatória para exposição a poeiras minerais e agentes químicos';
        periodicityValue = 12; // Anual
      }

      // Raio-X de tórax para poeiras minerais
      if (
        riskNameLower.includes('poeira') &&
        riskNameLower.includes('sílica') &&
        exam.name.includes('Raio-X de Tórax')
      ) {
        shouldSuggest = true;
        reasoning = 'NR-7: Raio-X de tórax obrigatório para exposição a poeiras minerais (silicose)';
        periodicityValue = 12;
      }

      // Agrotóxicos → Acetilcolinesterase
      if (
        (riskNameLower.includes('agrotóxico') ||
          riskNameLower.includes('organofosforado') ||
          riskNameLower.includes('carbamato')) &&
        exam.name.includes('Acetilcolinesterase')
      ) {
        shouldSuggest = true;
        reasoning = 'NR-7: Acetilcolinesterase obrigatória para exposição a organofosforados e carbamatos';
        periodicityValue = 6; // Semestral
      }

      // Chumbo → Plumbemia
      if (riskNameLower.includes('chumbo') && exam.name.includes('Chumbo no Sangue')) {
        shouldSuggest = true;
        reasoning = 'NR-7: Plumbemia obrigatória para exposição ocupacional a chumbo';
        periodicityValue = 6; // Semestral
      }

      // Mercúrio → Mercúrio Urinário
      if (riskNameLower.includes('mercúrio') && exam.name.includes('Mercúrio Urinário')) {
        shouldSuggest = true;
        reasoning = 'NR-7: Dosagem de mercúrio urinário obrigatória para exposição a mercúrio';
        periodicityValue = 6; // Semestral
      }

      // Benzeno → Ácido trans-trans-Mucônico
      if (riskNameLower.includes('benzeno') && exam.name.includes('Benzeno')) {
        shouldSuggest = true;
        reasoning = 'NR-7: Ácido trans-trans-Mucônico obrigatório para exposição a benzeno';
        periodicityValue = 6; // Semestral
      }

      if (shouldSuggest) {
        suggestions.push({
          examId: exam.id,
          examName: exam.name,
          category: exam.category,
          periodicityType,
          periodicityValue,
          reasoning,
        });
      }
    }

    return { suggestions };
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
