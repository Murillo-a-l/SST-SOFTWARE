import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';
import { TerminateEmploymentDto } from './dto/terminate-employment.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class EmploymentService {
  constructor(private prisma: PrismaService) {}

  async create(createEmploymentDto: CreateEmploymentDto) {
    // Verificar se o trabalhador existe
    const worker = await this.prisma.worker.findUnique({
      where: { id: createEmploymentDto.workerId },
    });

    if (!worker) {
      throw new ResourceNotFoundException('Worker', createEmploymentDto.workerId);
    }

    // Verificar se o cargo existe
    const job = await this.prisma.job.findUnique({
      where: { id: createEmploymentDto.jobId },
      include: {
        company: true,
      },
    });

    if (!job) {
      throw new ResourceNotFoundException('Job', createEmploymentDto.jobId);
    }

    // Verificar se o trabalhador pertence à mesma empresa do cargo
    if (worker.companyId !== job.companyId) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'O trabalhador e o cargo devem pertencer à mesma empresa',
      );
    }

    // Verificar se já existe vínculo ativo para este trabalhador neste cargo
    const activeEmployment = await this.prisma.employment.findFirst({
      where: {
        workerId: createEmploymentDto.workerId,
        jobId: createEmploymentDto.jobId,
        employmentEndDate: null,
      },
    });

    if (activeEmployment) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Já existe um vínculo empregatício ativo para este trabalhador neste cargo',
      );
    }

    // Criar vínculo empregatício
    const employment = await this.prisma.employment.create({
      data: {
        workerId: createEmploymentDto.workerId,
        companyId: job.companyId,
        jobId: createEmploymentDto.jobId,
        employmentStartDate: new Date(createEmploymentDto.employmentStartDate),
        employmentEndDate: createEmploymentDto.employmentEndDate
          ? new Date(createEmploymentDto.employmentEndDate)
          : undefined,
        notes: createEmploymentDto.notes,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
            company: {
              select: {
                id: true,
                corporateName: true,
                tradeName: true,
              },
            },
          },
        },
      },
    });

    return employment;
  }

  async findAll(workerId?: string, jobId?: string, includeTerminated = false) {
    const employments = await this.prisma.employment.findMany({
      where: {
        ...(workerId && { workerId }),
        ...(jobId && { jobId }),
        ...(includeTerminated ? {} : { employmentEndDate: null }),
      },
      orderBy: {
        employmentStartDate: 'desc',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
            company: {
              select: {
                id: true,
                corporateName: true,
                tradeName: true,
              },
            },
          },
        },
      },
    });

    return employments;
  }

  async findOne(id: string) {
    const employment = await this.prisma.employment.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
            description: true,
            company: {
              select: {
                id: true,
                corporateName: true,
                tradeName: true,
                isDelinquent: true,
              },
            },
          },
        },
      },
    });

    if (!employment) {
      throw new ResourceNotFoundException('Employment', id);
    }

    return employment;
  }

  async update(id: string, updateEmploymentDto: UpdateEmploymentDto) {
    // Verificar se vínculo existe
    await this.findOne(id);

    const employment = await this.prisma.employment.update({
      where: { id },
      data: {
        ...updateEmploymentDto,
        ...(updateEmploymentDto.employmentStartDate && {
          employmentStartDate: new Date(updateEmploymentDto.employmentStartDate),
        }),
        ...(updateEmploymentDto.employmentEndDate && {
          employmentEndDate: new Date(updateEmploymentDto.employmentEndDate),
        }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
          },
        },
      },
    });

    return employment;
  }

  async terminate(id: string, terminateDto: TerminateEmploymentDto) {
    // Verificar se vínculo existe
    const employment = await this.findOne(id);

    // Verificar se já está terminado
    if (employment.employmentEndDate) {
      throw new BusinessException(
        BusinessErrorCode.EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED,
        'Este vínculo empregatício já foi terminado',
      );
    }

    // Verificar se a data de término é posterior à data de início
    const endDate = new Date(terminateDto.employmentEndDate);
    if (endDate < employment.employmentStartDate) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Data de término não pode ser anterior à data de início do vínculo',
      );
    }

    // Terminar vínculo
    const terminatedEmployment = await this.prisma.employment.update({
      where: { id },
      data: {
        employmentEndDate: endDate,
        notes: terminateDto.notes || employment.notes,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            cbo: true,
          },
        },
      },
    });

    return {
      message: 'Vínculo empregatício terminado com sucesso',
      employment: terminatedEmployment,
    };
  }

  async remove(id: string) {
    // Verificar se vínculo existe
    await this.findOne(id);

    // Verificar se tem documentos associados
    const documentsCount = await this.prisma.document.count({
      where: { employmentId: id },
    });

    if (documentsCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível excluir vínculo com ${documentsCount} documento(s) associado(s)`,
      );
    }

    // Deletar vínculo
    await this.prisma.employment.delete({
      where: { id },
    });

    return { message: 'Vínculo empregatício excluído com sucesso' };
  }

  async checkIfTerminated(employmentId: string) {
    const employment = await this.prisma.employment.findUnique({
      where: { id: employmentId },
      select: { employmentEndDate: true },
    });

    if (!employment) {
      throw new ResourceNotFoundException('Employment', employmentId);
    }

    if (employment.employmentEndDate) {
      throw new BusinessException(
        BusinessErrorCode.EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED,
        'Não é possível criar novos documentos para vínculo empregatício terminado',
        { employmentId },
      );
    }

    return { isTerminated: false };
  }
}
