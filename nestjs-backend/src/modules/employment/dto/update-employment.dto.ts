import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEmploymentDto } from './create-employment.dto';

export class UpdateEmploymentDto extends PartialType(
  OmitType(CreateEmploymentDto, ['workerId', 'jobId'] as const)
) {}
