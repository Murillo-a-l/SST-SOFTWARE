import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: createJobDto.companyId },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', createJobDto.companyId);
    }

    // Verificar se já existe cargo com mesmo título na mesma empresa
    const existingJob = await this.prisma.job.findFirst({
      where: {
        title: createJobDto.title,
        companyId: createJobDto.companyId,
      },
    });

    if (existingJob) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Já existe um cargo com o título "${createJobDto.title}" nesta empresa`,
        { field: 'title' },
      );
    }

    // Criar cargo
    const job = await this.prisma.job.create({
      data: {
        title: createJobDto.title,
        cbo: createJobDto.cbo,
        description: createJobDto.description,
        companyId: createJobDto.companyId,
        active: createJobDto.active ?? true,
      },
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
      },
    });

    return job;
  }

  async findAll(companyId?: string, includeInactive = false) {
    const jobs = await this.prisma.job.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: {
        title: 'asc',
      },
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        _count: {
          select: {
            employments: true,
          },
        },
      },
    });

    return jobs;
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        employments: {
          where: {
            employmentEndDate: null,
          },
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
          orderBy: {
            employmentStartDate: 'desc',
          },
        },
        _count: {
          select: {
            employments: true,
          },
        },
      },
    });

    if (!job) {
      throw new ResourceNotFoundException('Job', id);
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    // Verificar se cargo existe
    const existingJob = await this.findOne(id);

    // Se está mudando o título, verificar se já existe outro cargo com esse título na mesma empresa
    if (updateJobDto.title && updateJobDto.title !== existingJob.title) {
      const duplicateJob = await this.prisma.job.findFirst({
        where: {
          title: updateJobDto.title,
          companyId: existingJob.companyId,
        },
      });

      if (duplicateJob && duplicateJob.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          `Já existe outro cargo com o título "${updateJobDto.title}" nesta empresa`,
          { field: 'title' },
        );
      }
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
      },
    });

    return job;
  }

  async remove(id: string) {
    // Verificar se cargo existe
    await this.findOne(id);

    // Verificar se tem vínculos empregatícios ativos
    const activeEmploymentsCount = await this.prisma.employment.count({
      where: {
        jobId: id,
        employmentEndDate: null,
      },
    });

    if (activeEmploymentsCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível desativar cargo com ${activeEmploymentsCount} vínculo(s) empregatício(s) ativo(s)`,
      );
    }

    // Soft delete - apenas desativa o cargo
    await this.prisma.job.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Cargo desativado com sucesso' };
  }

  async findByCbo(cbo: string) {
    const jobs = await this.prisma.job.findMany({
      where: { cbo, active: true },
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return jobs;
  }
}
