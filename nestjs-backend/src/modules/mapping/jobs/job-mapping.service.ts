import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJobMappingDto } from './dto/create-job-mapping.dto';
import { UpdateJobMappingDto } from './dto/update-job-mapping.dto';
import { UpdateJobNotesDto } from './dto/update-job-notes.dto';
import { AddJobEnvironmentDto } from './dto/add-job-environment.dto';
import { AddJobRiskDto } from './dto/add-job-risk.dto';
import { AddJobExamDto } from './dto/add-job-exam.dto';
import { DuplicateFieldException, InvalidRelationshipException } from '../shared/exceptions';

@Injectable()
export class JobMappingService {
  constructor(private prisma: PrismaService) {}

  private async validateEnvironmentBelongsToCompany(environmentId: string, companyId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    if (environment.companyId !== companyId) {
      throw new InvalidRelationshipException(
        'O ambiente não pertence à mesma empresa do cargo',
      );
    }
  }

  async create(createDto: CreateJobMappingDto) {
    // Validate company
    const company = await this.prisma.company.findUnique({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Validate main environment
    if (createDto.mainEnvironmentId) {
      await this.validateEnvironmentBelongsToCompany(
        createDto.mainEnvironmentId,
        createDto.companyId,
      );
    }

    // Create job
    const job = await this.prisma.job.create({
      data: {
        companyId: createDto.companyId,
        title: createDto.title,
        cbo: createDto.cbo,
        mainEnvironmentId: createDto.mainEnvironmentId,
      },
    });

    // Add environments
    if (createDto.environmentIds && createDto.environmentIds.length > 0) {
      await this.addMultipleEnvironments(job.id, createDto.environmentIds);
    }

    // Add risks
    if (createDto.riskIds && createDto.riskIds.length > 0) {
      await this.addMultipleRisks(job.id, createDto.riskIds);
    }

    return this.findOne(job.id);
  }

  async findAll(filters?: { companyId?: string; active?: boolean }) {
    const where: any = {};

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        mainEnvironment: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            jobEnvironments: true,
            jobRisks: true,
            jobExams: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        mainEnvironment: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        jobEnvironments: {
          include: {
            environment: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        jobRisks: {
          include: {
            risk: {
              select: {
                id: true,
                name: true,
                type: true,
                code: true,
              },
            },
          },
        },
        jobExams: true,
        jobNotes: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Cargo não encontrado');
    }

    return job;
  }

  async update(id: string, updateDto: UpdateJobMappingDto) {
    await this.findOne(id);

    // Validate main environment if changing
    if (updateDto.mainEnvironmentId && updateDto.companyId) {
      await this.validateEnvironmentBelongsToCompany(
        updateDto.mainEnvironmentId,
        updateDto.companyId,
      );
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        title: updateDto.title,
        cbo: updateDto.cbo,
        mainEnvironmentId: updateDto.mainEnvironmentId,
      },
      include: {
        mainEnvironment: true,
        jobEnvironments: {
          include: { environment: true },
        },
        jobRisks: {
          include: { risk: true },
        },
        jobExams: true,
        jobNotes: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.job.update({
      where: { id },
      data: { active: false },
    });
  }

  // Notes management

  async updateNotes(jobId: string, notesDto: UpdateJobNotesDto) {
    await this.findOne(jobId);

    const existing = await this.prisma.jobNotes.findUnique({
      where: { jobId },
    });

    if (existing) {
      return this.prisma.jobNotes.update({
        where: { jobId },
        data: notesDto,
      });
    } else {
      return this.prisma.jobNotes.create({
        data: {
          jobId,
          ...notesDto,
        },
      });
    }
  }

  async getNotes(jobId: string) {
    const notes = await this.prisma.jobNotes.findUnique({
      where: { jobId },
    });

    return notes || null;
  }

  // Environment management

  private async addMultipleEnvironments(jobId: string, environmentIds: string[]) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Cargo não encontrado');

    for (const envId of environmentIds) {
      await this.validateEnvironmentBelongsToCompany(envId, job.companyId);

      const existing = await this.prisma.jobEnvironment.findUnique({
        where: {
          jobId_environmentId: {
            jobId,
            environmentId: envId,
          },
        },
      });

      if (!existing) {
        await this.prisma.jobEnvironment.create({
          data: {
            jobId,
            environmentId: envId,
          },
        });
      }
    }
  }

  async addEnvironment(jobId: string, dto: AddJobEnvironmentDto) {
    const job = await this.findOne(jobId);

    await this.validateEnvironmentBelongsToCompany(dto.environmentId, job.companyId);

    const existing = await this.prisma.jobEnvironment.findUnique({
      where: {
        jobId_environmentId: {
          jobId,
          environmentId: dto.environmentId,
        },
      },
    });

    if (existing) {
      throw new DuplicateFieldException('environment', 'Este ambiente já está vinculado ao cargo');
    }

    return this.prisma.jobEnvironment.create({
      data: {
        jobId,
        environmentId: dto.environmentId,
      },
      include: {
        environment: true,
      },
    });
  }

  async removeEnvironment(jobId: string, environmentId: string) {
    const jobEnvironment = await this.prisma.jobEnvironment.findUnique({
      where: {
        jobId_environmentId: {
          jobId,
          environmentId,
        },
      },
    });

    if (!jobEnvironment) {
      throw new NotFoundException('Ambiente não vinculado a este cargo');
    }

    await this.prisma.jobEnvironment.delete({
      where: { id: jobEnvironment.id },
    });
  }

  async getEnvironments(jobId: string) {
    await this.findOne(jobId);

    return this.prisma.jobEnvironment.findMany({
      where: { jobId },
      include: {
        environment: true,
      },
    });
  }

  // Risk management

  private async addMultipleRisks(jobId: string, riskIds: string[]) {
    for (const riskId of riskIds) {
      const risk = await this.prisma.risk.findUnique({ where: { id: riskId } });
      if (!risk) continue;

      const existing = await this.prisma.jobRisk.findUnique({
        where: {
          jobId_riskId: {
            jobId,
            riskId,
          },
        },
      });

      if (!existing) {
        await this.prisma.jobRisk.create({
          data: {
            jobId,
            riskId,
          },
        });
      }
    }
  }

  async addRisk(jobId: string, dto: AddJobRiskDto) {
    await this.findOne(jobId);

    const risk = await this.prisma.risk.findUnique({
      where: { id: dto.riskId },
    });

    if (!risk) {
      throw new NotFoundException('Risco não encontrado');
    }

    const existing = await this.prisma.jobRisk.findUnique({
      where: {
        jobId_riskId: {
          jobId,
          riskId: dto.riskId,
        },
      },
    });

    if (existing) {
      throw new DuplicateFieldException('risk', 'Este risco já está vinculado ao cargo');
    }

    return this.prisma.jobRisk.create({
      data: {
        jobId,
        riskId: dto.riskId,
        intensity: dto.intensity,
        notes: dto.notes,
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

  async removeRisk(jobId: string, riskId: string) {
    const jobRisk = await this.prisma.jobRisk.findUnique({
      where: {
        jobId_riskId: {
          jobId,
          riskId,
        },
      },
    });

    if (!jobRisk) {
      throw new NotFoundException('Risco não vinculado a este cargo');
    }

    await this.prisma.jobRisk.delete({
      where: { id: jobRisk.id },
    });
  }

  async getRisks(jobId: string) {
    await this.findOne(jobId);

    return this.prisma.jobRisk.findMany({
      where: { jobId },
      include: {
        risk: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  // Exam management

  async addExam(jobId: string, dto: AddJobExamDto) {
    await this.findOne(jobId);

    const existing = await this.prisma.jobExam.findUnique({
      where: {
        jobId_examName: {
          jobId,
          examName: dto.examName,
        },
      },
    });

    if (existing) {
      throw new DuplicateFieldException('exam', 'Este exame já está vinculado ao cargo');
    }

    return this.prisma.jobExam.create({
      data: {
        jobId,
        examName: dto.examName,
        notes: dto.notes,
      },
    });
  }

  async removeExam(jobId: string, examName: string) {
    const jobExam = await this.prisma.jobExam.findUnique({
      where: {
        jobId_examName: {
          jobId,
          examName,
        },
      },
    });

    if (!jobExam) {
      throw new NotFoundException('Exame não vinculado a este cargo');
    }

    await this.prisma.jobExam.delete({
      where: { id: jobExam.id },
    });
  }

  async getExams(jobId: string) {
    await this.findOne(jobId);

    return this.prisma.jobExam.findMany({
      where: { jobId },
      orderBy: { examName: 'asc' },
    });
  }
}



