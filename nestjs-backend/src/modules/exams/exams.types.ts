/**
 * Tipos e Enums Compartilhados - Módulo de Exames e PCMSO
 *
 * Este arquivo centraliza todas as definições de tipos compartilhadas
 * entre os submódulos do sistema de Exames e PCMSO.
 */

// ============= ENUMS =============

/**
 * Categoria do Exame Ocupacional
 */
export enum ExamCategory {
  CLINICAL = 'CLINICAL',               // Exame clínico
  LABORATORY = 'LABORATORY',           // Exames laboratoriais
  IMAGING = 'IMAGING',                 // Exames de imagem
  COMPLEMENTARY = 'COMPLEMENTARY',     // Exames complementares
  PSYCHOSOCIAL = 'PSYCHOSOCIAL',       // Avaliação psicossocial
  FUNCTIONAL = 'FUNCTIONAL',           // Testes funcionais
  OTHER = 'OTHER',                     // Outros
}

/**
 * Tipo de Periodicidade do Exame
 */
export enum PeriodicityType {
  NONE = 'NONE',                       // Sem periodicidade
  ON_ADMISSION = 'ON_ADMISSION',       // Admissional
  ON_DISMISSAL = 'ON_DISMISSAL',       // Demissional
  ON_RETURN = 'ON_RETURN',             // Retorno ao trabalho
  ON_CHANGE = 'ON_CHANGE',             // Mudança de risco
  PERIODIC = 'PERIODIC',               // Periódico
  CUSTOM = 'CUSTOM',                   // Regra customizada
}

/**
 * Origem do Exame no PCMSO
 */
export enum ExamSourceType {
  RISK = 'RISK',                       // Originado de risco
  JOB = 'JOB',                         // Originado de cargo
  MANUAL = 'MANUAL',                   // Adicionado manualmente
  AI_SUGGESTION = 'AI_SUGGESTION',     // Sugestão da IA
  NR7_REQUIREMENT = 'NR7_REQUIREMENT', // Exigência NR-7
}

/**
 * Status do PCMSO (versionado)
 */
export enum PCMSOStatus {
  DRAFT = 'DRAFT',                     // Rascunho (editável)
  UNDER_REVIEW = 'UNDER_REVIEW',       // Em revisão
  SIGNED = 'SIGNED',                   // Assinado (imutável)
  ARCHIVED = 'ARCHIVED',               // Arquivado
  OUTDATED = 'OUTDATED',               // Desatualizado
}

// ============= TIPOS E INTERFACES =============

/**
 * Regra de Periodicidade Avançada
 * Permite definir regras complexas de periodicidade baseadas em condições
 */
export interface PeriodicityAdvancedRule {
  type: 'age_based' | 'intensity_based' | 'exposure_time_based' | 'combined';
  conditions: {
    minAge?: number;
    maxAge?: number;
    intensityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    exposureMonths?: number;
    periodicityMonths: number;
  }[];
  defaultPeriodicityMonths: number;
}

/**
 * Contexto para IA
 * Informações necessárias para que a IA faça sugestões inteligentes
 */
export interface AIContext {
  riskId?: string;
  riskType?: string;
  riskName?: string;
  jobId?: string;
  jobTitle?: string;
  jobCBO?: string;
  workerAge?: number;
  exposureLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Resultado da Detecção de Mudanças no PCMSO
 */
export interface ChangeDetectionResult {
  hasChanges: boolean;
  lastSignedVersion?: {
    id: string;
    versionNumber: number;
    signedAt: Date;
    signedByUserId: string;
  };
  changes: {
    type: 'EXAM_ADDED' | 'EXAM_REMOVED' | 'PERIODICITY_CHANGED' | 'RULE_ADDED' | 'RULE_REMOVED';
    description: string;
    affectedExamId?: string;
    affectedExamName?: string;
    oldValue?: any;
    newValue?: any;
  }[];
  affectedJobs: {
    jobId: string;
    jobTitle: string;
    changeCount: number;
  }[];
  affectedRisks: {
    riskId: string;
    riskName: string;
    changeCount: number;
  }[];
}

/**
 * Opções de Geração do PCMSO
 */
export interface GenerationOptions {
  includeAISuggestions?: boolean;
  applyNR7Rules?: boolean;
  considerWorkerAge?: boolean;
  template?: 'standard' | 'simplified' | 'detailed';
  customTitle?: string;
}

/**
 * Diff Estruturado entre Versões do PCMSO
 */
export interface PCMSODiff {
  fromVersion: number;
  toVersion: number;
  examsAdded: {
    examId: string;
    examName: string;
    source: ExamSourceType;
    periodicityType: PeriodicityType;
    periodicityValue?: number;
  }[];
  examsRemoved: {
    examId: string;
    examName: string;
    wasSource: ExamSourceType;
  }[];
  examsModified: {
    examId: string;
    examName: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  }[];
  rulesAdded: number;
  rulesRemoved: number;
  rulesModified: number;
}

/**
 * Resultado de Sugestão de Exame pela IA
 */
export interface ExamSuggestion {
  examId?: string;
  examName: string;
  category: ExamCategory;
  periodicityType: PeriodicityType;
  periodicityValue?: number;
  justification: string;
  confidence: number; // 0.0 a 1.0
  source: ExamSourceType;
  table27Codes?: string[];
}

/**
 * Filtros de Busca de Exames
 */
export interface ExamFiltersDto {
  category?: ExamCategory;
  active?: boolean;
  search?: string;
  table27Code?: string;
}

/**
 * Aplicabilidade do Exame (flags)
 */
export interface ExamApplicability {
  applicableOnAdmission: boolean;
  applicableOnDismissal: boolean;
  applicableOnReturn: boolean;
  applicableOnChange: boolean;
  applicablePeriodic: boolean;
}

/**
 * Regra Consolidada de Exame
 * Resultado final após mesclagem de regras de Risco + Cargo
 */
export interface ConsolidatedExamRule extends ExamApplicability {
  examId: string;
  examName: string;
  periodicityType: PeriodicityType;
  periodicityValue?: number;
  periodicityAdvancedRule?: PeriodicityAdvancedRule;
  source: ExamSourceType; // Pode ser múltiplo (RISK + JOB)
  overrideRiskRules: boolean;
  insertIntoASO: boolean;
  justification?: string;
  notes?: string;
}

/**
 * Validação de Conformidade NR-7
 */
export interface NR7ComplianceResult {
  isCompliant: boolean;
  missingExams: {
    examName: string;
    reason: string;
    requiredBy: 'NR7' | 'NR15' | 'RISK' | 'CBO';
  }[];
  incorrectPeriodicities: {
    examName: string;
    currentPeriodicity: number;
    recommendedPeriodicity: number;
    reason: string;
  }[];
  warnings: string[];
}

/**
 * Contexto de Mudança para Auditoria
 */
export interface ChangeContext {
  action: 'CREATE' | 'EDIT_CONTENT' | 'ADD_EXAM' | 'REMOVE_EXAM' | 'SIGN' | 'ARCHIVE' | 'EDIT_RULE';
  entityType?: 'EXAM' | 'RISK_RULE' | 'JOB_RULE' | 'PCMSO_VERSION';
  entityId?: string;
  entityName?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// ============= CONSTANTES =============

/**
 * Tradução das Categorias de Exames
 */
export const EXAM_CATEGORY_LABELS: Record<ExamCategory, string> = {
  [ExamCategory.CLINICAL]: 'Exame Clínico',
  [ExamCategory.LABORATORY]: 'Exames Laboratoriais',
  [ExamCategory.IMAGING]: 'Exames de Imagem',
  [ExamCategory.COMPLEMENTARY]: 'Exames Complementares',
  [ExamCategory.PSYCHOSOCIAL]: 'Avaliação Psicossocial',
  [ExamCategory.FUNCTIONAL]: 'Testes Funcionais',
  [ExamCategory.OTHER]: 'Outros',
};

/**
 * Tradução dos Tipos de Periodicidade
 */
export const PERIODICITY_TYPE_LABELS: Record<PeriodicityType, string> = {
  [PeriodicityType.NONE]: 'Sem Periodicidade',
  [PeriodicityType.ON_ADMISSION]: 'Admissional',
  [PeriodicityType.ON_DISMISSAL]: 'Demissional',
  [PeriodicityType.ON_RETURN]: 'Retorno ao Trabalho',
  [PeriodicityType.ON_CHANGE]: 'Mudança de Risco',
  [PeriodicityType.PERIODIC]: 'Periódico',
  [PeriodicityType.CUSTOM]: 'Regra Customizada',
};

/**
 * Tradução das Origens de Exame
 */
export const EXAM_SOURCE_LABELS: Record<ExamSourceType, string> = {
  [ExamSourceType.RISK]: 'Originado de Risco',
  [ExamSourceType.JOB]: 'Originado de Cargo',
  [ExamSourceType.MANUAL]: 'Adicionado Manualmente',
  [ExamSourceType.AI_SUGGESTION]: 'Sugestão da IA',
  [ExamSourceType.NR7_REQUIREMENT]: 'Exigência NR-7',
};

/**
 * Tradução dos Status do PCMSO
 */
export const PCMSO_STATUS_LABELS: Record<PCMSOStatus, string> = {
  [PCMSOStatus.DRAFT]: 'Rascunho',
  [PCMSOStatus.UNDER_REVIEW]: 'Em Revisão',
  [PCMSOStatus.SIGNED]: 'Assinado',
  [PCMSOStatus.ARCHIVED]: 'Arquivado',
  [PCMSOStatus.OUTDATED]: 'Desatualizado',
};
