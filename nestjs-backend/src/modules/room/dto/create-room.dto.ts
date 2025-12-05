import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Nome/número da sala',
    example: 'Sala 101 - Audiometria',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome da sala é obrigatório' })
  @Length(1, 100, { message: 'Nome deve ter entre 1 e 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descrição/tipo de sala',
    example: 'Sala equipada para exames audiométricos',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID da unidade clínica à qual a sala pertence',
    example: 'clh5x8y9z0000qwerty123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID da unidade clínica é obrigatório' })
  clinicUnitId: string;

  @ApiProperty({
    description: 'Sala está ativa',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
