import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddJobEnvironmentDto {
  @ApiProperty({ description: 'ID do ambiente' })
  @IsUUID()
  environmentId: string;
}



