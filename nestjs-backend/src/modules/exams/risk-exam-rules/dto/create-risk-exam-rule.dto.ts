import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateIf,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PeriodicityType, PeriodicityAdvancedRule } from '../../exams.types';

/**
 * DTO para criar uma nova regra de exame por risco
 *
 * Define quais exames são necessários quando um trabalhador está exposto a um determinado risco
 */
export class CreateRiskExamRuleDto {
  @ApiProperty({
    description: 'ID do risco ocupacional',
    example: 'ckw1x2y3z000001l5abcd1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID do risco é obrigatório' })
  riskId: string;

  @ApiProperty({
    description: 'ID do exame ocupacional',
    example: 'ckw1x2y3z000001l5exam5678',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID do exame é obrigatório' })
  examId: string;

  @ApiProperty({
    description: 'Tipo de periodicidade do exame',
    enum: PeriodicityType,
    example: PeriodicityType.PERIODIC,
  })
  @IsEnum(PeriodicityType, { message: 'Tipo de periodicidade inválido' })
  @IsNotEmpty({ message: 'O tipo de periodicidade é obrigatório' })
  periodicityType: PeriodicityType;

  @ApiPropertyOptional({
    description: 'Periodicidade em meses (obrigatório se periodicityType = PERIODIC)',
    example: 12,
    minimum: 1,
    maximum: 120,
  })
  @ValidateIf((o) => o.periodicityType === PeriodicityType.PERIODIC)
  @IsInt({ message: 'A periodicidade deve ser um número inteiro' })
  @Min(1, { message: 'A periodicidade deve ser no mínimo 1 mês' })
  @Max(120, { message: 'A periodicidade deve ser no máximo 120 meses (10 anos)' })
  @IsOptional()
  periodicityValue?: number;

  @ApiPropertyOptional({
    description: 'Regra avançada de periodicidade (JSON)',
    example: {
      type: 'age_based',
      conditions: [
        { minAge: 50, periodicityMonths: 6 },
        { maxAge: 49, periodicityMonths: 12 },
      ],
      defaultPeriodicityMonths: 12,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  @IsOptional()
  periodicityAdvancedRule?: PeriodicityAdvancedRule;

  @ApiPropertyOptional({
    description: 'Aplicável em exame admissional',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  applicableOnAdmission?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicável em exame demissional',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  applicableOnDismissal?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicável em retorno ao trabalho',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  applicableOnReturn?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicável em mudança de risco/função',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  applicableOnChange?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicável em exame periódico',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  applicablePeriodic?: boolean;

  @ApiPropertyOptional({
    description: 'Justificativa para a exigência do exame',
    example: 'NR-7 item 7.4.2 - Obrigatório para exposição a ruído acima de 85dB',
  })
  @IsString()
  @IsOptional()
  justification?: string;

  @ApiPropertyOptional({
    description: 'Recomendação gerada pela IA',
    example: 'Com base na NR-7 e NR-15, audiometria é obrigatória para trabalhadores expostos a ruído ocupacional',
  })
  @IsString()
  @IsOptional()
  aiRecommendation?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionais sobre a regra',
    example: 'Considerar nível de exposição ao ruído para determinar periodicidade',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Indica se a regra está ativa',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
