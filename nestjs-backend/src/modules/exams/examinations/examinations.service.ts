import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { ExamFiltersDto } from './dto/exam-filters.dto';
import { Examination } from '@prisma/client';

/**
 * Serviço de Gestão de Exames Ocupacionais
 *
 * Responsabilidades:
 * - CRUD completo de exames
 * - Busca e filtros
 * - Validação de códigos eSocial Tabela 27
 * - Verificação de dependências antes de excluir
 */
@Injectable()
export class ExaminationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar novo exame
   */
  async create(createExaminationDto: CreateExaminationDto): Promise<Examination> {
    // Verificar se já existe exame com o mesmo nome
    const existingExam = await this.prisma.examination.findUnique({
      where: { name: createExaminationDto.name },
    });

    if (existingExam) {
      throw new ConflictException(`Já existe um exame com o nome "${createExaminationDto.name}"`);
    }

    // Validar códigos da Tabela 27 (se fornecidos)
    if (createExaminationDto.table27Codes && createExaminationDto.table27Codes.length > 0) {
      this.validateTable27Codes(createExaminationDto.table27Codes);
    }

    return this.prisma.examination.create({
      data: {
        name: createExaminationDto.name,
        description: createExaminationDto.description,
        category: createExaminationDto.category,
        table27Codes: createExaminationDto.table27Codes || [],
        insertIntoASO: createExaminationDto.insertIntoASO ?? true,
        requiresJustification: createExaminationDto.requiresJustification ?? false,
        active: createExaminationDto.active ?? true,
      },
    });
  }

  /**
   * Listar exames com filtros opcionais
   */
  async findAll(filters?: ExamFiltersDto): Promise<Examination[]> {
    const where: any = {};

    if (filters) {
      if (filters.category !== undefined) {
        where.category = filters.category;
      }

      if (filters.active !== undefined) {
        where.active = filters.active;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.table27Code) {
        where.table27Codes = {
          has: filters.table27Code,
        };
      }
    }

    return this.prisma.examination.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            riskExamRules: true,
            jobExamRules: true,
            pcmsoExamRequirements: true,
          },
        },
      },
    });
  }

  /**
   * Buscar exame por ID
   */
  async findOne(id: string): Promise<Examination> {
    const examination = await this.prisma.examination.findUnique({
      where: { id },
      include: {
        riskExamRules: {
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
        jobExamRules: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                cbo: true,
              },
            },
          },
        },
        _count: {
          select: {
            pcmsoExamRequirements: true,
          },
        },
      },
    });

    if (!examination) {
      throw new NotFoundException(`Exame com ID "${id}" não encontrado`);
    }

    return examination;
  }

  /**
   * Atualizar exame existente
   */
  async update(id: string, updateExaminationDto: UpdateExaminationDto): Promise<Examination> {
    // Verificar se exame existe
    await this.findOne(id);

    // Se está atualizando o nome, verificar conflito
    if (updateExaminationDto.name) {
      const existingExam = await this.prisma.examination.findUnique({
        where: { name: updateExaminationDto.name },
      });

      if (existingExam && existingExam.id !== id) {
        throw new ConflictException(`Já existe outro exame com o nome "${updateExaminationDto.name}"`);
      }
    }

    // Validar códigos da Tabela 27 (se fornecidos)
    if (updateExaminationDto.table27Codes && updateExaminationDto.table27Codes.length > 0) {
      this.validateTable27Codes(updateExaminationDto.table27Codes);
    }

    return this.prisma.examination.update({
      where: { id },
      data: updateExaminationDto,
    });
  }

  /**
   * Excluir exame (soft delete)
   */
  async remove(id: string): Promise<void> {
    // Verificar se exame existe
    const examination = await this.findOne(id);

    // Verificar se o exame está sendo usado em regras ativas
    const activeRiskRulesCount = await this.prisma.examRuleByRisk.count({
      where: {
        examId: id,
        active: true,
      },
    });

    const activeJobRulesCount = await this.prisma.examRuleByJob.count({
      where: {
        examId: id,
        active: true,
      },
    });

    if (activeRiskRulesCount > 0 || activeJobRulesCount > 0) {
      throw new ConflictException(
        `Não é possível excluir o exame "${examination.name}" pois ele está sendo utilizado em ${
          activeRiskRulesCount + activeJobRulesCount
        } regra(s) ativa(s). ` +
          `Desative as regras primeiro ou marque o exame como inativo.`,
      );
    }

    // Soft delete: marcar como inativo
    await this.prisma.examination.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Buscar exames por termo (nome ou descrição)
   */
  async search(term: string): Promise<Examination[]> {
    if (!term || term.trim().length === 0) {
      throw new BadRequestException('O termo de busca não pode estar vazio');
    }

    return this.prisma.examination.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
        active: true,
      },
      orderBy: [
        {
          name: 'asc',
        },
      ],
      take: 50, // Limitar resultados
    });
  }

  /**
   * Validar códigos da Tabela 27 do eSocial
   *
   * Formato esperado: XX.XX.XX.XXX (ex: 05.01.01.003)
   */
  private validateTable27Codes(codes: string[]): void {
    const table27Pattern = /^\d{2}\.\d{2}\.\d{2}\.\d{3}$/;

    for (const code of codes) {
      if (!table27Pattern.test(code)) {
        throw new BadRequestException(
          `Código da Tabela 27 inválido: "${code}". ` +
            `Formato esperado: XX.XX.XX.XXX (ex: 05.01.01.003)`,
        );
      }
    }
  }

  /**
   * Validar array de códigos da Tabela 27 (endpoint público)
   */
  async validateTable27CodesEndpoint(codes: string[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const table27Pattern = /^\d{2}\.\d{2}\.\d{2}\.\d{3}$/;

    for (const code of codes) {
      if (!table27Pattern.test(code)) {
        errors.push(`Código inválido: "${code}". Formato esperado: XX.XX.XX.XXX`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obter todos os códigos únicos da Tabela 27 em uso
   */
  async getAllTable27Codes(): Promise<string[]> {
    const examinations = await this.prisma.examination.findMany({
      where: {
        active: true,
        table27Codes: {
          isEmpty: false,
        },
      },
      select: {
        table27Codes: true,
      },
    });

    // Flatten e remover duplicatas
    const allCodes = examinations.flatMap((exam) => exam.table27Codes);
    return [...new Set(allCodes)].sort();
  }
}
