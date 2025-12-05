import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateEmploymentDto {
  @ApiProperty({
    description: 'ID do trabalhador',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do trabalhador é obrigatório' })
  workerId: string;

  @ApiProperty({
    description: 'ID do cargo',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do cargo é obrigatório' })
  jobId: string;

  @ApiProperty({
    description: 'Data de início do vínculo empregatício',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  employmentStartDate: string;

  @ApiProperty({
    description: 'Data de término do vínculo empregatício (demissão)',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsOptional()
  employmentEndDate?: string;

  @ApiProperty({
    description: 'Observações sobre o vínculo empregatício',
    example: 'Transferido do setor de TI para RH',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
