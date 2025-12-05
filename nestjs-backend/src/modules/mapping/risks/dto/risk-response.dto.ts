import { ApiProperty } from '@nestjs/swagger';
import { RiskType } from '../../shared/enums';

export class RiskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ enum: RiskType })
  type: RiskType;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  sourceGenerator?: string;

  @ApiProperty({ required: false })
  healthEffects?: string;

  @ApiProperty({ required: false })
  controlMeasures?: string;

  @ApiProperty()
  allowsIntensity: boolean;

  @ApiProperty()
  isGlobal: boolean;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'Categoria do risco', required: false })
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
}



