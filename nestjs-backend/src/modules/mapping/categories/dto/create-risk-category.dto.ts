import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateRiskCategoryDto {
  @ApiProperty({ description: 'Nome da categoria' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Descrição', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cor (hex)', example: '#FF5722', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiProperty({ description: 'Ícone', example: 'zap', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}



