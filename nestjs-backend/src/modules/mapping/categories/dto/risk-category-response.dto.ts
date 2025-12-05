import { ApiProperty } from '@nestjs/swagger';

export class RiskCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Contagem de riscos', required: false })
  _count?: {
    risks: number;
  };
}



