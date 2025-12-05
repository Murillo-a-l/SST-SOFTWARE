import { ApiProperty } from '@nestjs/swagger';

export class JobMappingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  cbo: string;

  @ApiProperty({ required: false })
  mainEnvironmentId?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Ambiente principal', required: false })
  mainEnvironment?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };

  @ApiProperty({ description: 'Ambientes vinculados', type: 'array', required: false })
  jobEnvironments?: Array<{
    id: string;
    environment: {
      id: string;
      name: string;
    };
  }>;

  @ApiProperty({ description: 'Riscos vinculados', type: 'array', required: false })
  jobRisks?: Array<{
    id: string;
    intensity?: string;
    risk: {
      id: string;
      name: string;
      type: string;
    };
  }>;

  @ApiProperty({ description: 'Exames vinculados', type: 'array', required: false })
  jobExams?: Array<{
    id: string;
    examName: string;
  }>;

  @ApiProperty({ description: 'Notas e textos do cargo', required: false })
  jobNotes?: {
    activities?: string;
    generalRecommendations?: string;
    ergonomicMethodology?: string;
    generalObservations?: string;
    technicalOpinionLTCAT?: string;
    technicalOpinionDanger?: string;
    technicalOpinionInsalubrity?: string;
  };
}



