import { PartialType } from '@nestjs/swagger';
import { CreateExaminationDto } from './create-examination.dto';

/**
 * DTO para atualizar um exame existente
 *
 * Todos os campos são opcionais (extends PartialType)
 */
export class UpdateExaminationDto extends PartialType(CreateExaminationDto) {}
