import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto extends PartialType(
  OmitType(CreateWorkerDto, ['companyId'] as const)
) {}
