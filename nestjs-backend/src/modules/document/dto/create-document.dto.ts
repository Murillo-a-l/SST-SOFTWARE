import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { DocumentType, DocumentStatus, AsoConclusion } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Tipo do documento',
    enum: DocumentType,
    example: 'ASO',
  })
  @IsEnum(DocumentType, { message: 'Tipo de documento inválido' })
  @IsNotEmpty({ message: 'Tipo de documento é obrigatório' })
  type: DocumentType;

  @ApiProperty({
    description: 'ID do trabalhador',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do trabalhador é obrigatório' })
  workerId: string;

  @ApiProperty({
    description: 'ID do vínculo empregatício',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do vínculo empregatício é obrigatório' })
  employmentId: string;

  @ApiProperty({
    description: 'Data de emissão do documento',
    example: '2024-12-15',
  })
  @IsDateString({}, { message: 'Data de emissão deve ser válida' })
  @IsNotEmpty({ message: 'Data de emissão é obrigatória' })
  issueDate: string;

  @ApiProperty({
    description: 'Data de validade do documento (se aplicável)',
    example: '2025-12-15',
    required: false,
  })
  @IsDateString({}, { message: 'Data de validade deve ser válida' })
  @IsOptional()
  expirationDate?: string;

  @ApiProperty({
    description: 'Conclusão do ASO (se tipo for ASO)',
    enum: AsoConclusion,
    example: 'APTO',
    required: false,
  })
  @IsEnum(AsoConclusion, { message: 'Conclusão de ASO inválida' })
  @IsOptional()
  asoConclusion?: AsoConclusion;

  @ApiProperty({
    description: 'Indica se este ASO demissional deve desligar o funcionário',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  dismissEmployee?: boolean;

  @ApiProperty({
    description: 'Observações/notas sobre o documento',
    example: 'Trabalhador apresenta restrição para trabalho em altura',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
