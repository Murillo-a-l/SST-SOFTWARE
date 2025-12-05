import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TerminateEmploymentDto {
  @ApiProperty({
    description: 'Data de término do vínculo empregatício (demissão)',
    example: '2024-12-31',
  })
  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de término é obrigatória' })
  employmentEndDate: string;

  @ApiProperty({
    description: 'Motivo/observações sobre a demissão',
    example: 'Pedido de demissão',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
