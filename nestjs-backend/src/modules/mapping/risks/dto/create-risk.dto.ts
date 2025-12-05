import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { RiskType } from '../../shared/enums';

export class CreateRiskDto {
  @ApiProperty({ description: 'ID da categoria' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: RiskType, description: 'Tipo de risco' })
  @IsEnum(RiskType)
  type: RiskType;

  @ApiProperty({ description: 'Código do risco (ex: S-2240)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: 'Nome do risco' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Descrição', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Fonte geradora', required: false })
  @IsOptional()
  @IsString()
  sourceGenerator?: string;

  @ApiProperty({ description: 'Efeitos à saúde', required: false })
  @IsOptional()
  @IsString()
  healthEffects?: string;

  @ApiProperty({ description: 'Medidas de controle', required: false })
  @IsOptional()
  @IsString()
  controlMeasures?: string;

  @ApiProperty({ description: 'Permite classificação de intensidade', default: false })
  @IsOptional()
  @IsBoolean()
  allowsIntensity?: boolean;

  @ApiProperty({ description: 'Disponível globalmente para todas as empresas', default: true })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}



