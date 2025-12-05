import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class ProcedureService {
  constructor(private prisma: PrismaService) {}

  async create(createProcedureDto: CreateProcedureDto) {
    // Verificar se já existe procedimento com mesmo nome
    const existingProcedure = await this.prisma.procedure.findUnique({
      where: { name: createProcedureDto.name },
    });

    if (existingProcedure) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Já existe um procedimento com o nome "${createProcedureDto.name}"`,
        { field: 'name' },
      );
    }

    // Criar procedimento
    const procedure = await this.prisma.procedure.create({
      data: createProcedureDto,
    });

    return procedure;
  }

  async findAll() {
    const procedures = await this.prisma.procedure.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            appointmentProcedures: true,
          },
        },
      },
    });

    return procedures;
  }

  async findOne(id: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id },
      include: {
        appointmentProcedures: {
          include: {
            appointment: {
              select: {
                id: true,
                appointmentDate: true,
                context: true,
                status: true,
                worker: {
                  select: {
                    id: true,
                    name: true,
                    cpf: true,
                  },
                },
              },
            },
          },
          orderBy: {
            appointment: {
              appointmentDate: 'desc',
            },
          },
          take: 20,
        },
        _count: {
          select: {
            appointmentProcedures: true,
          },
        },
      },
    });

    if (!procedure) {
      throw new ResourceNotFoundException('Procedure', id);
    }

    return procedure;
  }

  async findByCode(code: string) {
    const procedure = await this.prisma.procedure.findUnique({
      where: { code },
    });

    if (!procedure) {
      throw new ResourceNotFoundException('Procedure', `Código: ${code}`);
    }

    return procedure;
  }

  async update(id: string, updateProcedureDto: UpdateProcedureDto) {
    // Verificar se procedimento existe
    await this.findOne(id);

    // Se está mudando o nome, verificar se já existe
    if (updateProcedureDto.name) {
      const existingProcedure = await this.prisma.procedure.findUnique({
        where: { name: updateProcedureDto.name },
      });

      if (existingProcedure && existingProcedure.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          `Já existe outro procedimento com o nome "${updateProcedureDto.name}"`,
          { field: 'name' },
        );
      }
    }

    const procedure = await this.prisma.procedure.update({
      where: { id },
      data: updateProcedureDto,
    });

    return procedure;
  }

  async remove(id: string) {
    // Verificar se procedimento existe
    await this.findOne(id);

    // Verificar se tem agendamentos associados
    const appointmentProceduresCount =
      await this.prisma.appointmentProcedure.count({
        where: { procedureId: id },
      });

    if (appointmentProceduresCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível excluir procedimento com ${appointmentProceduresCount} agendamento(s) associado(s)`,
      );
    }

    // Deletar procedimento
    await this.prisma.procedure.delete({
      where: { id },
    });

    return { message: 'Procedimento excluído com sucesso' };
  }

  async search(query: string) {
    const procedures = await this.prisma.procedure.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });

    return procedures;
  }
}
