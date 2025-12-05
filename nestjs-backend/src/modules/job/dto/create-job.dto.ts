import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'Título do cargo',
    example: 'Analista de Sistemas',
  })
  @IsString()
  @IsNotEmpty({ message: 'Título do cargo é obrigatório' })
  @Length(3, 255, { message: 'Título deve ter entre 3 e 255 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Código CBO (Classificação Brasileira de Ocupações)',
    example: '2124-05',
  })
  @IsString()
  @IsNotEmpty({ message: 'Código CBO é obrigatório' })
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'CBO deve estar no formato XXXX-XX (ex: 2124-05)',
  })
  cbo: string;

  @ApiProperty({
    description: 'Descrição detalhada das atividades do cargo',
    example: 'Desenvolver e manter sistemas de informação...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID da empresa à qual o cargo pertence',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  companyId: string;

  @ApiProperty({
    description: 'Cargo está ativo no sistema',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
