import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsUUID, IsDateString, MaxLength, ValidateIf } from 'class-validator';
import { EnvironmentLocationType } from '../../shared/enums';

export class CreateEnvironmentDto {
  @ApiProperty({ description: 'ID da empresa' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'Nome do ambiente' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: EnvironmentLocationType, description: 'Tipo de local' })
  @IsEnum(EnvironmentLocationType)
  locationType: EnvironmentLocationType;

  @ApiProperty({ description: 'Descrição do ambiente', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cor (hex)', example: '#FF9800', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiProperty({ description: 'Ícone', example: 'building', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: 'Registrado no eSocial', default: false })
  @IsOptional()
  @IsBoolean()
  registeredInESocial?: boolean;

  @ApiProperty({ description: 'Código anterior do eSocial (obrigatório se registeredInESocial=true)', required: false })
  @ValidateIf((o) => o.registeredInESocial === true)
  @IsString()
  @MaxLength(100)
  previousESocialCode?: string;

  @ApiProperty({ description: 'Data de início da validade (obrigatório se registeredInESocial=true)', required: false })
  @ValidateIf((o) => o.registeredInESocial === true)
  @IsDateString()
  validityStart?: string;

  @ApiProperty({ description: 'Data de fim da validade', required: false })
  @IsOptional()
  @IsDateString()
  validityEnd?: string;

  @ApiProperty({ description: 'Código de tributação S-2240', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  esocialTaxCode?: string;
}



