import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  ValidateIf,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodicityType } from '@prisma/client';
import { PeriodicityAdvancedRule } from '../../exams.types';

export class CreateJobExamRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do cargo é obrigatório' })
  jobId: string;

  @IsString()
  @IsNotEmpty({ message: 'O ID do exame é obrigatório' })
  examId: string;

  @IsEnum(PeriodicityType, { message: 'Tipo de periodicidade inválido' })
  @IsNotEmpty({ message: 'O tipo de periodicidade é obrigatório' })
  periodicityType: PeriodicityType;

  @ValidateIf((o) => o.periodicityType === PeriodicityType.PERIODIC)
  @IsInt({ message: 'O valor de periodicidade deve ser um número inteiro' })
  @Min(1, { message: 'O valor mínimo de periodicidade é 1 mês' })
  @Max(120, { message: 'O valor máximo de periodicidade é 120 meses (10 anos)' })
  @IsOptional()
  periodicityValue?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  @IsOptional()
  periodicityAdvancedRule?: PeriodicityAdvancedRule;

  @IsBoolean()
  @IsOptional()
  applicableOnAdmission?: boolean;

  @IsBoolean()
  @IsOptional()
  applicableOnDismissal?: boolean;

  @IsBoolean()
  @IsOptional()
  applicableOnReturn?: boolean;

  @IsBoolean()
  @IsOptional()
  applicableOnChange?: boolean;

  @IsBoolean()
  @IsOptional()
  applicablePeriodic?: boolean;

  @IsBoolean()
  @IsOptional()
  overrideRiskRules?: boolean;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsString()
  @IsOptional()
  aiRecommendation?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
