import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExamCategory } from '../../exams.types';

/**
 * DTO para filtrar exames na listagem
 *
 * Todos os campos são opcionais
 */
export class ExamFiltersDto {
  @ApiPropertyOptional({
    description: 'Filtrar por categoria de exame',
    enum: ExamCategory,
    example: ExamCategory.LABORATORY,
  })
  @IsEnum(ExamCategory, { message: 'Categoria de exame inválida' })
  @IsOptional()
  category?: ExamCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por status ativo/inativo',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar por nome ou descrição (texto parcial)',
    example: 'audio',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por código da Tabela 27 do eSocial',
    example: '05.01.01.003',
  })
  @IsString()
  @IsOptional()
  table27Code?: string;
}
