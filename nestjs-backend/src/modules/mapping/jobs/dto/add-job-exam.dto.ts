import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AddJobExamDto {
  @ApiProperty({ description: 'Nome do exame' })
  @IsString()
  @MaxLength(200)
  examName: string;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}



