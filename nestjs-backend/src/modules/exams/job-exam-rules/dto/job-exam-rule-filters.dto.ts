import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PeriodicityType } from '@prisma/client';

export class JobExamRuleFiltersDto {
  @IsString()
  @IsOptional()
  jobId?: string;

  @IsString()
  @IsOptional()
  examId?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsEnum(PeriodicityType)
  @IsOptional()
  periodicityType?: PeriodicityType;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  overrideRiskRules?: boolean;
}
