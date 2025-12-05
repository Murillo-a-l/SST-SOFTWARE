import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { RiskIntensity } from '../../shared/enums';

export class AddJobRiskDto {
  @ApiProperty({ description: 'ID do risco' })
  @IsUUID()
  riskId: string;

  @ApiProperty({ enum: RiskIntensity, description: 'Intensidade do risco', required: false })
  @IsOptional()
  @IsEnum(RiskIntensity)
  intensity?: RiskIntensity;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}



