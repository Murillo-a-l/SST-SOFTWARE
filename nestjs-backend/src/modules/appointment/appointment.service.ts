import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AddProceduresDto } from './dto/add-procedures.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    // Verificar se o trabalhador existe
    const worker = await this.prisma.worker.findUnique({
      where: { id: createAppointmentDto.workerId },
    });

    if (!worker) {
      throw new ResourceNotFoundException('Worker', createAppointmentDto.workerId);
    }

    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: createAppointmentDto.companyId },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', createAppointmentDto.companyId);
    }

    // Verificar se a sala existe (se informada)
    if (createAppointmentDto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: createAppointmentDto.roomId },
      });

      if (!room) {
        throw new ResourceNotFoundException('Room', createAppointmentDto.roomId);
      }
    }

    // Criar agendamento
    const appointment = await this.prisma.appointment.create({
      data: {
        workerId: createAppointmentDto.workerId,
        companyId: createAppointmentDto.companyId,
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        context: createAppointmentDto.context,
        status: AppointmentStatus.TO_COME,
        roomId: createAppointmentDto.roomId,
        notes: createAppointmentDto.notes,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            clinicUnit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return appointment;
  }

  async findAll(workerId?: string, companyId?: string, status?: AppointmentStatus) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...(workerId && { workerId }),
        ...(companyId && { companyId }),
        ...(status && { status }),
      },
      orderBy: {
        appointmentDate: 'desc',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            appointmentProcedures: true,
          },
        },
      },
    });

    return appointments;
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
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
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
            isDelinquent: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            clinicUnit: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
        appointmentProcedures: {
          include: {
            procedure: {
              select: {
                id: true,
                name: true,
                code: true,
                durationMinutes: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new ResourceNotFoundException('Appointment', id);
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    // Verificar se agendamento existe
    await this.findOne(id);

    // Se está mudando a sala, verificar se existe
    if (updateAppointmentDto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: updateAppointmentDto.roomId },
      });

      if (!room) {
        throw new ResourceNotFoundException('Room', updateAppointmentDto.roomId);
      }
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        ...(updateAppointmentDto.appointmentDate && {
          appointmentDate: new Date(updateAppointmentDto.appointmentDate),
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
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return appointment;
  }

  async updateStatus(id: string, newStatus: AppointmentStatus) {
    const appointment = await this.findOne(id);

    // Validar transições de status
    this.validateStatusTransition(appointment.status, newStatus);

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: newStatus },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
      },
    });

    return updatedAppointment;
  }

  private validateStatusTransition(currentStatus: AppointmentStatus, newStatus: AppointmentStatus) {
    const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      TO_COME: [AppointmentStatus.WAITING, AppointmentStatus.CANCELLED],
      WAITING: [AppointmentStatus.IN_SERVICE, AppointmentStatus.CANCELLED],
      IN_SERVICE: [AppointmentStatus.DONE, AppointmentStatus.CANCELLED],
      DONE: [], // Não permite transição de DONE
      CANCELLED: [], // Não permite transição de CANCELLED
      RESCHEDULED: [], // Não permite transição de RESCHEDULED
      CANCELED: [], // Alias de CANCELLED
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Transição de status inválida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  async addProcedures(id: string, addProceduresDto: AddProceduresDto) {
    const appointment = await this.findOne(id);

    // Verificar se agendamento está em status que permite adicionar procedimentos
    if (appointment.status === AppointmentStatus.DONE || appointment.status === AppointmentStatus.CANCELLED) {
      throw new BusinessException(
        BusinessErrorCode.APPOINTMENT_HAS_OPEN_PROCEDURES,
        'Não é possível adicionar procedimentos a agendamento finalizado ou cancelado',
      );
    }

    // Verificar se todos os procedimentos existem
    const procedures = await this.prisma.procedure.findMany({
      where: {
        id: { in: addProceduresDto.procedureIds },
      },
    });

    if (procedures.length !== addProceduresDto.procedureIds.length) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Um ou mais procedimentos não foram encontrados',
      );
    }

    // Adicionar procedimentos
    const appointmentProcedures = await Promise.all(
      addProceduresDto.procedureIds.map((procedureId) =>
        this.prisma.appointmentProcedure.create({
          data: {
            appointmentId: id,
            procedureId,
          },
          include: {
            procedure: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        }),
      ),
    );

    return {
      message: 'Procedimentos adicionados com sucesso',
      procedures: appointmentProcedures,
    };
  }

  async removeProcedure(appointmentId: string, procedureId: string) {
    const appointment = await this.findOne(appointmentId);

    // Verificar se agendamento está em status que permite remover procedimentos
    if (appointment.status === AppointmentStatus.DONE || appointment.status === AppointmentStatus.CANCELLED) {
      throw new BusinessException(
        BusinessErrorCode.APPOINTMENT_HAS_OPEN_PROCEDURES,
        'Não é possível remover procedimentos de agendamento finalizado ou cancelado',
      );
    }

    // Verificar se o procedimento está vinculado ao agendamento
    const appointmentProcedure = await this.prisma.appointmentProcedure.findFirst({
      where: {
        appointmentId,
        procedureId,
      },
    });

    if (!appointmentProcedure) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Procedimento não encontrado neste agendamento',
      );
    }

    // Remover procedimento
    await this.prisma.appointmentProcedure.delete({
      where: { id: appointmentProcedure.id },
    });

    return { message: 'Procedimento removido com sucesso' };
  }

  async remove(id: string) {
    const appointment = await this.findOne(id);

    // Verificar se tem procedimentos vinculados
    const proceduresCount = await this.prisma.appointmentProcedure.count({
      where: { appointmentId: id },
    });

    if (proceduresCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.APPOINTMENT_HAS_OPEN_PROCEDURES,
        `Não é possível excluir agendamento com ${proceduresCount} procedimento(s) vinculado(s). Remova os procedimentos primeiro.`,
      );
    }

    // Deletar agendamento
    await this.prisma.appointment.delete({
      where: { id },
    });

    return { message: 'Agendamento excluído com sucesso' };
  }

  async getWaitingRoom() {
    const waitingAppointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.WAITING,
      },
      orderBy: {
        appointmentDate: 'asc',
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        company: {
          select: {
            id: true,
            corporateName: true,
            tradeName: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            appointmentProcedures: true,
          },
        },
      },
    });

    return waitingAppointments;
  }
}
