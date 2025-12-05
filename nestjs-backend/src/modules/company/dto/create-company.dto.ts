import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsPhoneNumber,
  Length,
  Matches,
} from 'class-validator';
import { IsCNPJ } from '../../../common/validators/cnpj.validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa XYZ Ltda',
  })
  @IsString()
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @Length(3, 255, { message: 'Razão social deve ter entre 3 e 255 caracteres' })
  corporateName: string;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: 'XYZ Solutions',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 255, { message: 'Nome fantasia deve ter entre 3 e 255 caracteres' })
  tradeName?: string;

  @ApiProperty({
    description: 'CNPJ da empresa (apenas números)',
    example: '12345678000190',
  })
  @IsString()
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter exatamente 14 dígitos numéricos' })
  @IsCNPJ()
  cnpj: string;

  @ApiProperty({
    description: 'Email principal da empresa',
    example: 'contato@empresaxyz.com.br',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Telefone da empresa',
    example: '+5511999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Endereço completo da empresa',
    example: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP 01234-567',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Indica se a empresa está inadimplente',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDelinquent?: boolean;

  @ApiProperty({
    description: 'Empresa está ativa no sistema',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
