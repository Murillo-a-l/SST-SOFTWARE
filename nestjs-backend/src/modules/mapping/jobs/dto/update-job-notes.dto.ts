import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateJobNotesDto {
  @ApiProperty({ description: 'Atividades do cargo', required: false })
  @IsOptional()
  @IsString()
  activities?: string;

  @ApiProperty({ description: 'Recomendações gerais', required: false })
  @IsOptional()
  @IsString()
  generalRecommendations?: string;

  @ApiProperty({ description: 'Metodologia ergonômica', required: false })
  @IsOptional()
  @IsString()
  ergonomicMethodology?: string;

  @ApiProperty({ description: 'Observações gerais', required: false })
  @IsOptional()
  @IsString()
  generalObservations?: string;

  @ApiProperty({ description: 'Parecer técnico LTCAT', required: false })
  @IsOptional()
  @IsString()
  technicalOpinionLTCAT?: string;

  @ApiProperty({ description: 'Parecer técnico de periculosidade', required: false })
  @IsOptional()
  @IsString()
  technicalOpinionDanger?: string;

  @ApiProperty({ description: 'Parecer técnico de insalubridade', required: false })
  @IsOptional()
  @IsString()
  technicalOpinionInsalubrity?: string;
}



