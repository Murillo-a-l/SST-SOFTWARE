import { PartialType } from '@nestjs/swagger';
import { CreateJobMappingDto } from './create-job-mapping.dto';

export class UpdateJobMappingDto extends PartialType(CreateJobMappingDto) {}



