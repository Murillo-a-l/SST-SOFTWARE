import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateJobMappingDto {
  @ApiProperty({ description: 'ID da empresa' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'Título do cargo' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Código CBO' })
  @IsString()
  @MaxLength(20)
  cbo: string;

  @ApiProperty({ description: 'ID do ambiente principal', required: false })
  @IsOptional()
  @IsUUID()
  mainEnvironmentId?: string;

  @ApiProperty({ description: 'IDs dos ambientes associados', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  environmentIds?: string[];

  @ApiProperty({ description: 'IDs dos riscos associados', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  riskIds?: string[];
}



