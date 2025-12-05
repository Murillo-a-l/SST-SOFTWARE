import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FinalizeDocumentDto {
  @ApiProperty({
    description: 'Observações finais antes de finalizar o documento',
    example: 'Documento revisado e aprovado',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
