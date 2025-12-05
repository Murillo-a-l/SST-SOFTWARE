import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClinicUnitDto } from './dto/create-clinic-unit.dto';
import { UpdateClinicUnitDto } from './dto/update-clinic-unit.dto';
import {
  BusinessException,
  BusinessErrorCode,
  ResourceNotFoundException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class ClinicUnitService {
  constructor(private prisma: PrismaService) {}

  async create(createClinicUnitDto: CreateClinicUnitDto) {
    // Verificar se já existe unidade com mesmo nome
    const existingUnit = await this.prisma.clinicUnit.findUnique({
      where: { name: createClinicUnitDto.name },
    });

    if (existingUnit) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Já existe uma unidade com o nome "${createClinicUnitDto.name}"`,
        { field: 'name' },
      );
    }

    // Criar unidade
    const unit = await this.prisma.clinicUnit.create({
      data: {
        name: createClinicUnitDto.name,
        address: createClinicUnitDto.address,
        phone: createClinicUnitDto.phone,
        active: createClinicUnitDto.active ?? true,
      },
    });

    return unit;
  }

  async findAll(includeInactive = false) {
    const units = await this.prisma.clinicUnit.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    return units;
  }

  async findOne(id: string) {
    const unit = await this.prisma.clinicUnit.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { active: true },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!unit) {
      throw new ResourceNotFoundException('ClinicUnit', id);
    }

    return unit;
  }

  async update(id: string, updateClinicUnitDto: UpdateClinicUnitDto) {
    // Verificar se unidade existe
    await this.findOne(id);

    // Se está mudando o nome, verificar se já existe
    if (updateClinicUnitDto.name) {
      const existingUnit = await this.prisma.clinicUnit.findUnique({
        where: { name: updateClinicUnitDto.name },
      });

      if (existingUnit && existingUnit.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          `Já existe outra unidade com o nome "${updateClinicUnitDto.name}"`,
          { field: 'name' },
        );
      }
    }

    const unit = await this.prisma.clinicUnit.update({
      where: { id },
      data: updateClinicUnitDto,
    });

    return unit;
  }

  async remove(id: string) {
    // Verificar se unidade existe
    await this.findOne(id);

    // Verificar se tem salas ativas
    const activeRoomsCount = await this.prisma.room.count({
      where: {
        clinicUnitId: id,
        active: true,
      },
    });

    if (activeRoomsCount > 0) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        `Não é possível desativar unidade com ${activeRoomsCount} sala(s) ativa(s)`,
      );
    }

    // Soft delete - apenas desativa a unidade
    await this.prisma.clinicUnit.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Unidade desativada com sucesso' };
  }
}
