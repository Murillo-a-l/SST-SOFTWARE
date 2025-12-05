import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { AppointmentContext } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID do trabalhador',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do trabalhador é obrigatório' })
  workerId: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  companyId: string;

  @ApiProperty({
    description: 'Data e hora do agendamento',
    example: '2024-12-15T14:30:00Z',
  })
  @IsDateString({}, { message: 'Data de agendamento deve ser válida' })
  @IsNotEmpty({ message: 'Data de agendamento é obrigatória' })
  appointmentDate: string;

  @ApiProperty({
    description: 'Contexto do exame ocupacional',
    enum: AppointmentContext,
    example: 'ADMISSIONAL',
  })
  @IsEnum(AppointmentContext, { message: 'Contexto inválido' })
  @IsNotEmpty({ message: 'Contexto é obrigatório' })
  context: AppointmentContext;

  @ApiProperty({
    description: 'ID da sala (opcional)',
    example: 'clh5x8y9z0000qwerty123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiProperty({
    description: 'Observações sobre o agendamento',
    example: 'Paciente com restrição de mobilidade',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
