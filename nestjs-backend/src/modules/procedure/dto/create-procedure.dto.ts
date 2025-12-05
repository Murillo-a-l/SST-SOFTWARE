import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Length,
} from 'class-validator';

export class CreateProcedureDto {
  @ApiProperty({
    description: 'Nome do procedimento',
    example: 'Audiometria Tonal',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome do procedimento é obrigatório' })
  @Length(3, 255, { message: 'Nome deve ter entre 3 e 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Código do procedimento (ex: TUSS, CBHPM)',
    example: '40201015',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Descrição detalhada do procedimento',
    example: 'Exame auditivo para avaliação de limiares tonais...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Valor padrão do procedimento em centavos (R$ 150,00 = 15000)',
    example: 15000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Valor não pode ser negativo' })
  defaultPrice?: number;

  @ApiProperty({
    description: 'Duração estimada do procedimento em minutos',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Duração deve ser pelo menos 1 minuto' })
  durationMinutes?: number;
}
