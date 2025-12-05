import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    // Verificar se a unidade clínica existe
    const clinicUnit = await this.prisma.clinicUnit.findUnique({
      where: { id: createRoomDto.clinicUnitId },
    });

    if (!clinicUnit) {
      throw new ResourceNotFoundException(
        'ClinicUnit',
        createRoomDto.clinicUnitId,
      );
    }

    // Verificar se já existe sala com mesmo nome na mesma unidade
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        name: createRoomDto.name,
        clinicUnitId: createRoomDto.clinicUnitId,
      },
    });

    if (existingRoom) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Já existe uma sala com o nome "${createRoomDto.name}" nesta unidade`,
        { field: 'name' },
      );
    }

    // Criar sala
    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        description: createRoomDto.description,
        clinicUnitId: createRoomDto.clinicUnitId,
        active: createRoomDto.active ?? true,
      },
      include: {
        clinicUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return room;
  }

  async findAll(clinicUnitId?: string, includeInactive = false) {
    const rooms = await this.prisma.room.findMany({
      where: {
        ...(clinicUnitId && { clinicUnitId }),
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        clinicUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return rooms;
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        clinicUnit: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!room) {
      throw new ResourceNotFoundException('Room', id);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    // Verificar se sala existe
    const existingRoom = await this.findOne(id);

    // Se está mudando o nome, verificar se já existe na mesma unidade
    if (updateRoomDto.name && updateRoomDto.name !== existingRoom.name) {
      const duplicateRoom = await this.prisma.room.findFirst({
        where: {
          name: updateRoomDto.name,
          clinicUnitId: existingRoom.clinicUnitId,
        },
      });

      if (duplicateRoom && duplicateRoom.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          `Já existe outra sala com o nome "${updateRoomDto.name}" nesta unidade`,
          { field: 'name' },
        );
      }
    }

    const room = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        clinicUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return room;
  }

  async remove(id: string) {
    // Verificar se sala existe
    await this.findOne(id);

    // Soft delete - apenas desativa a sala
    await this.prisma.room.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Sala desativada com sucesso' };
  }
}
