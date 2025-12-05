import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRiskCategoryDto } from './dto/create-risk-category.dto';
import { UpdateRiskCategoryDto } from './dto/update-risk-category.dto';
import { DuplicateFieldException, CannotDeleteDependencyException } from '../shared/exceptions';

@Injectable()
export class RiskCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateRiskCategoryDto) {
    const existing = await this.prisma.riskCategory.findUnique({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new DuplicateFieldException('name', createDto.name);
    }

    return this.prisma.riskCategory.create({
      data: createDto,
      include: {
        _count: {
          select: { risks: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.riskCategory.findMany({
      include: {
        _count: {
          select: { risks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.riskCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { risks: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria de risco não encontrada');
    }

    return category;
  }

  async update(id: string, updateDto: UpdateRiskCategoryDto) {
    await this.findOne(id);

    if (updateDto.name) {
      const existing = await this.prisma.riskCategory.findUnique({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new DuplicateFieldException('name', updateDto.name);
      }
    }

    return this.prisma.riskCategory.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: { risks: true },
        },
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const riskCount = await this.prisma.risk.count({
      where: { categoryId: id },
    });

    if (riskCount > 0) {
      throw new CannotDeleteDependencyException('categoria', riskCount, 'riscos');
    }

    await this.prisma.riskCategory.delete({ where: { id } });
  }
}



