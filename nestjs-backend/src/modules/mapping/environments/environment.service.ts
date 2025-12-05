import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { AddEnvironmentRiskDto } from './dto/add-environment-risk.dto';
import { DuplicateFieldException } from '../shared/exceptions';

@Injectable()
export class EnvironmentService {
  constructor(private prisma: PrismaService) {}

  private validateESocialRules(data: CreateEnvironmentDto | UpdateEnvironmentDto) {
    if (data.registeredInESocial) {
      if (!data.previousESocialCode) {
        throw new BadRequestException(
          'Código anterior do eSocial é obrigatório quando registeredInESocial = true',
        );
      }
      if (!data.validityStart) {
        throw new BadRequestException(
          'Data de início da validade é obrigatória quando registeredInESocial = true',
        );
      }
    }
  }

  async create(createDto: CreateEnvironmentDto) {
    this.validateESocialRules(createDto);

    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Check unique name per company
    const existing = await this.prisma.environment.findUnique({
      where: {
        companyId_name: {
          companyId: createDto.companyId,
          name: createDto.name,
        },
      },
    });

    if (existing) {
      throw new DuplicateFieldException('name', `${createDto.name} (nesta empresa)`);
    }

    return this.prisma.environment.create({
      data: createDto,
      include: {
        _count: {
          select: {
            environmentRisks: true,
            jobEnvironments: true,
            mainJobs: true,
          },
        },
      },
    });
  }

  async findAll(filters?: { companyId?: string; active?: boolean }) {
    const where: any = {};

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    return this.prisma.environment.findMany({
      where,
      include: {
        _count: {
          select: {
            environmentRisks: true,
            jobEnvironments: true,
            mainJobs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            environmentRisks: true,
            jobEnvironments: true,
            mainJobs: true,
          },
        },
      },
    });

    if (!environment) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    return environment;
  }

  async update(id: string, updateDto: UpdateEnvironmentDto) {
    await this.findOne(id);

    this.validateESocialRules(updateDto);

    // Check unique name per company if changing name
    if (updateDto.name && updateDto.companyId) {
      const existing = await this.prisma.environment.findFirst({
        where: {
          companyId: updateDto.companyId,
          name: updateDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new DuplicateFieldException('name', `${updateDto.name} (nesta empresa)`);
      }
    }

    return this.prisma.environment.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: {
            environmentRisks: true,
            jobEnvironments: true,
            mainJobs: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.environment.update({
      where: { id },
      data: { active: false },
    });
  }

  // Risk management

  async addRisk(environmentId: string, addRiskDto: AddEnvironmentRiskDto) {
    const environment = await this.findOne(environmentId);

    const risk = await this.prisma.risk.findUnique({
      where: { id: addRiskDto.riskId },
    });

    if (!risk) {
      throw new NotFoundException('Risco não encontrado');
    }

    // Check if already exists
    const existing = await this.prisma.environmentRisk.findUnique({
      where: {
        environmentId_riskId: {
          environmentId,
          riskId: addRiskDto.riskId,
        },
      },
    });

    if (existing) {
      throw new DuplicateFieldException('risk', 'Este risco já está vinculado ao ambiente');
    }

    return this.prisma.environmentRisk.create({
      data: {
        environmentId,
        riskId: addRiskDto.riskId,
        intensity: addRiskDto.intensity,
        notes: addRiskDto.notes,
      },
      include: {
        risk: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async removeRisk(environmentId: string, riskId: string) {
    const environmentRisk = await this.prisma.environmentRisk.findUnique({
      where: {
        environmentId_riskId: {
          environmentId,
          riskId,
        },
      },
    });

    if (!environmentRisk) {
      throw new NotFoundException('Risco não vinculado a este ambiente');
    }

    await this.prisma.environmentRisk.delete({
      where: { id: environmentRisk.id },
    });
  }

  async getRisks(environmentId: string) {
    await this.findOne(environmentId);

    return this.prisma.environmentRisk.findMany({
      where: { environmentId },
      include: {
        risk: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        risk: {
          name: 'asc',
        },
      },
    });
  }
}



