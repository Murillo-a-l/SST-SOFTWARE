import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'Dr. João Silva',
    description: 'Nome completo do usuário'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'joao@ocupalli.com',
    description: 'Email único do usuário'
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    minLength: 6,
    description: 'Senha do usuário'
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.DOCTOR,
    description: 'Role do usuário no sistema'
  })
  @IsEnum(UserRole, { message: 'Role inválida' })
  role: UserRole;

  @ApiProperty({
    example: true,
    default: true,
    required: false,
    description: 'Se o usuário está ativo'
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
