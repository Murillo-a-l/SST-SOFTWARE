import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessException, BusinessErrorCode, ResourceNotFoundException } from '../../common/exceptions/business.exception';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BusinessException(
        BusinessErrorCode.VALIDATION_ERROR,
        'Email já cadastrado',
        { field: 'email' },
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
        active: createUserDto.active ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se usuário existe
    await this.findOne(id);

    // Se está mudando o email, verificar se já existe
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BusinessException(
          BusinessErrorCode.VALIDATION_ERROR,
          'Email já cadastrado por outro usuário',
          { field: 'email' },
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    // Verificar se usuário existe
    await this.findOne(id);

    // Soft delete - apenas desativa o usuário
    await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Usuário desativado com sucesso' };
  }

  async changePassword(id: string, newPassword: string) {
    // Verificar se usuário existe
    await this.findOne(id);

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Invalidar todos os refresh tokens do usuário
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
