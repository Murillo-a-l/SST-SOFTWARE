import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentLocationType } from '../../shared/enums';

export class EnvironmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: EnvironmentLocationType })
  locationType: EnvironmentLocationType;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  registeredInESocial: boolean;

  @ApiProperty({ required: false })
  previousESocialCode?: string;

  @ApiProperty({ required: false })
  validityStart?: Date;

  @ApiProperty({ required: false })
  validityEnd?: Date;

  @ApiProperty({ required: false })
  esocialTaxCode?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Contagem de relações', required: false })
  _count?: {
    environmentRisks: number;
    jobEnvironments: number;
    mainJobs: number;
  };
}



