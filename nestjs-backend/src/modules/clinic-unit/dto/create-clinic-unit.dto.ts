import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateClinicUnitDto {
  @ApiProperty({
    description: 'Nome da unidade clínica',
    example: 'Unidade Central - São Paulo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Endereço completo da unidade',
    example: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP - CEP 01310-100',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Telefone da unidade',
    example: '+5511999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Unidade está ativa',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
