import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { RiskType } from '../shared/enums';
import { DuplicateFieldException } from '../shared/exceptions';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateRiskDto) {
    // Validate category exists
    const category = await this.prisma.riskCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria de risco não encontrada');
    }

    // Check for duplicate name
    if (createDto.name) {
      const existing = await this.prisma.risk.findUnique({
        where: { name: createDto.name },
      });

      if (existing) {
        throw new DuplicateFieldException('name', createDto.name);
      }
    }

    // Check for duplicate code
    if (createDto.code) {
      const existing = await this.prisma.risk.findUnique({
        where: { code: createDto.code },
      });

      if (existing) {
        throw new DuplicateFieldException('code', createDto.code);
      }
    }

    return this.prisma.risk.create({
      data: createDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(filters?: {
    type?: RiskType;
    categoryId?: string;
    isGlobal?: boolean;
    active?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isGlobal !== undefined) {
      where.isGlobal = filters.isGlobal;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.risk.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const risk = await this.prisma.risk.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            environmentRisks: true,
            jobRisks: true,
            riskExams: true,
          },
        },
      },
    });

    if (!risk) {
      throw new NotFoundException('Risco não encontrado');
    }

    return risk;
  }

  async update(id: string, updateDto: UpdateRiskDto) {
    await this.findOne(id);

    // Check for duplicate name (if changing)
    if (updateDto.name) {
      const existing = await this.prisma.risk.findUnique({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new DuplicateFieldException('name', updateDto.name);
      }
    }

    // Check for duplicate code (if changing)
    if (updateDto.code) {
      const existing = await this.prisma.risk.findUnique({
        where: { code: updateDto.code },
      });

      if (existing && existing.id !== id) {
        throw new DuplicateFieldException('code', updateDto.code);
      }
    }

    return this.prisma.risk.update({
      where: { id },
      data: updateDto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - mark as inactive instead of deleting
    return this.prisma.risk.update({
      where: { id },
      data: { active: false },
    });
  }
}



