import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto) {
    // Verificar se CPF já existe
    const existingWorker = await this.prisma.worker.findUnique({
      where: { cpf: createWorkerDto.cpf },
    });

    if (existingWorker) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'CPF já cadastrado no sistema',
        { field: 'cpf' },
      );
    }

    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: createWorkerDto.companyId },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', createWorkerDto.companyId);
    }

    // Criar trabalhador
    const worker = await this.prisma.worker.create({
      data: {
        name: createWorkerDto.name,
        cpf: createWorkerDto.cpf,
        email: createWorkerDto.email,
        phone: createWorkerDto.phone,
        birthDate: new Date(createWorkerDto.birthDate),
        address: createWorkerDto.address,
        companyId: createWorkerDto.companyId,
        active: createWorkerDto.active ?? true,
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

    return worker;
  }

  async findAll(companyId?: string, includeInactive = false) {
    const workers = await this.prisma.worker.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: {
        name: 'asc',
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
            appointments: true,
            documents: true,
          },
        },
      },
    });

    return workers;
  }

  async findOne(id: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
            isDelinquent: true,
          },
        },
        employments: {
          orderBy: {
            employmentStartDate: 'desc',
          },
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
        appointments: {
          orderBy: {
            appointmentDate: 'desc',
          },
          take: 10,
        },
        documents: {
          orderBy: {
            issueDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            employments: true,
            appointments: true,
            documents: true,
          },
        },
      },
    });

    if (!worker) {
      throw new ResourceNotFoundException('Worker', id);
    }

    return worker;
  }

  async findByCpf(cpf: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { cpf },
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

    if (!worker) {
      throw new ResourceNotFoundException('Worker', `CPF: ${cpf}`);
    }

    return worker;
  }

  async update(id: string, updateWorkerDto: UpdateWorkerDto) {
    // Verificar se trabalhador existe
    await this.findOne(id);

    // Se está mudando o CPF, verificar se já existe
    if (updateWorkerDto.cpf) {
      const existingWorker = await this.prisma.worker.findUnique({
        where: { cpf: updateWorkerDto.cpf },
      });

      if (existingWorker && existingWorker.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          'CPF já cadastrado por outro trabalhador',
          { field: 'cpf' },
        );
      }
    }

    const worker = await this.prisma.worker.update({
      where: { id },
      data: {
        ...updateWorkerDto,
        ...(updateWorkerDto.birthDate && {
          birthDate: new Date(updateWorkerDto.birthDate),
        }),
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

    return worker;
  }

  async remove(id: string) {
    // Verificar se trabalhador existe
    await this.findOne(id);

    // Verificar se tem vínculos empregatícios ativos
    const activeEmploymentsCount = await this.prisma.employment.count({
      where: {
        workerId: id,
        employmentEndDate: null,
      },
    });

    if (activeEmploymentsCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível desativar trabalhador com ${activeEmploymentsCount} vínculo(s) empregatício(s) ativo(s)`,
      );
    }

    // Soft delete - apenas desativa o trabalhador
    await this.prisma.worker.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Trabalhador desativado com sucesso' };
  }

  async reactivate(id: string) {
    // Verificar se trabalhador existe
    const worker = await this.findOne(id);

    if (worker.active) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Trabalhador já está ativo',
      );
    }

    await this.prisma.worker.update({
      where: { id },
      data: { active: true },
    });

    return { message: 'Trabalhador reativado com sucesso' };
  }
}
