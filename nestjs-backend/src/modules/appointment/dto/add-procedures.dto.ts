import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class AddProceduresDto {
  @ApiProperty({
    description: 'Lista de IDs de procedimentos a serem adicionados',
    example: ['clh5x8y9z0000qwerty123456', 'clh5x8y9z0000qwerty789012'],
    type: [String],
  })
  @IsArray({ message: 'procedureIds deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve incluir pelo menos um procedimento' })
  @IsString({ each: true, message: 'Cada procedureId deve ser uma string' })
  @IsNotEmpty({ each: true, message: 'IDs de procedimentos não podem ser vazios' })
  procedureIds: string[];
}
