import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
  Matches,
} from 'class-validator';
import { IsCPF } from '../../../common/validators/cpf.validator';

export class CreateWorkerDto {
  @ApiProperty({
    description: 'Nome completo do trabalhador',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'CPF do trabalhador (apenas números)',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos' })
  @IsCPF()
  cpf: string;

  @ApiProperty({
    description: 'Email do trabalhador',
    example: 'joao.silva@email.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Telefone do trabalhador',
    example: '+5511999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Data de nascimento do trabalhador',
    example: '1990-05-15',
  })
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  birthDate: string;

  @ApiProperty({
    description: 'Endereço completo do trabalhador',
    example: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP 01234-567',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'ID da empresa à qual o trabalhador pertence',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  companyId: string;

  @ApiProperty({
    description: 'Trabalhador está ativo no sistema',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
