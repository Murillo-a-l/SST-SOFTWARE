import { Module } from '@nestjs/common';
import { JobExamRulesService } from './job-exam-rules.service';
import { JobExamRulesController } from './job-exam-rules.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobExamRulesController],
  providers: [JobExamRulesService],
  exports: [JobExamRulesService],
})
export class JobExamRulesModule {}
