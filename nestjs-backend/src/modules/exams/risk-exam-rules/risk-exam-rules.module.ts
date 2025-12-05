import { Module } from '@nestjs/common';
import { RiskExamRulesService } from './risk-exam-rules.service';
import { RiskExamRulesController } from './risk-exam-rules.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskExamRulesController],
  providers: [RiskExamRulesService],
  exports: [RiskExamRulesService],
})
export class RiskExamRulesModule {}
