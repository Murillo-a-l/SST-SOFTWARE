import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsArray, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamCategory } from '../../exams.types';

/**
 * DTO para criar um novo exame ocupacional
 *
 * Validações:
 * - Nome obrigatório e único
 * - Categoria obrigatória
 * - Códigos eSocial opcionais mas válidos
 */
export class CreateExaminationDto {
  @ApiProperty({
    description: 'Nome do exame ocupacional',
    example: 'Audiometria Tonal',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do exame é obrigatório' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  @MaxLength(200, { message: 'O nome deve ter no máximo 200 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do exame',
    example: 'Exame audiométrico para avaliação da acuidade auditiva em trabalhadores expostos a ruído ocupacional',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Categoria do exame',
    enum: ExamCategory,
    example: ExamCategory.COMPLEMENTARY,
  })
  @IsEnum(ExamCategory, { message: 'Categoria de exame inválida' })
  @IsNotEmpty({ message: 'A categoria do exame é obrigatória' })
  category: ExamCategory;

  @ApiPropertyOptional({
    description: 'Códigos da Tabela 27 do eSocial',
    example: ['05.01.01.003'],
    type: [String],
  })
  @IsArray({ message: 'table27Codes deve ser um array' })
  @IsString({ each: true, message: 'Cada código da Tabela 27 deve ser uma string' })
  @IsOptional()
  table27Codes?: string[];

  @ApiPropertyOptional({
    description: 'Indica se o exame deve ser inserido automaticamente no ASO',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  insertIntoASO?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o exame requer justificativa ao ser adicionado',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresJustification?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o exame está ativo no sistema',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
