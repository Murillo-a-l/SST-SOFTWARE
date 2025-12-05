import { Module } from '@nestjs/common';
import { ExaminationsModule } from './examinations/examinations.module';
import { RiskExamRulesModule } from './risk-exam-rules/risk-exam-rules.module';
import { JobExamRulesModule } from './job-exam-rules/job-exam-rules.module';
import { PCMSOModule } from './pcmso/pcmso.module';

/**
 * Módulo Agregador de Exames e PCMSO
 *
 * Centraliza todos os submódulos relacionados a:
 * - Exames ocupacionais
 * - Regras de exames por risco
 * - Regras de exames por cargo
 * - Geração e versionamento de PCMSO
 * - Motor de regras NR-7
 * - Editor assistido por IA
 */
@Module({
  imports: [
    ExaminationsModule,
    RiskExamRulesModule,
    JobExamRulesModule,
    PCMSOModule,
  ],
  exports: [
    ExaminationsModule,
    RiskExamRulesModule,
    JobExamRulesModule,
    PCMSOModule,
  ],
})
export class ExamsModule {}
