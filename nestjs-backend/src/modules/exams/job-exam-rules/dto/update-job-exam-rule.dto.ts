import { PartialType } from '@nestjs/swagger';
import { CreateJobExamRuleDto } from './create-job-exam-rule.dto';

export class UpdateJobExamRuleDto extends PartialType(CreateJobExamRuleDto) {}
