import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'ID do documento ao qual o arquivo pertence',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID do documento é obrigatório' })
  documentId: string;
}
