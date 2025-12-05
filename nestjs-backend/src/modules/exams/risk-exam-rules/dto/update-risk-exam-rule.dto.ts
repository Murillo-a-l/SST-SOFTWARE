import { PartialType } from '@nestjs/swagger';
import { CreateRiskExamRuleDto } from './create-risk-exam-rule.dto';
import { OmitType } from '@nestjs/swagger';

/**
 * DTO para atualizar uma regra de exame por risco existente
 *
 * Omite riskId e examId pois não podem ser alterados (unique constraint)
 * Todos os demais campos são opcionais
 */
export class UpdateRiskExamRuleDto extends PartialType(
  OmitType(CreateRiskExamRuleDto, ['riskId', 'examId'] as const),
) {}
