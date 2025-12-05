# ESPECIFICAÇÃO DO MÓDULO DE EXAMES E PCMSO

**Data:** 01/12/2025
**Status:** Em Implementação
**Prioridade:** Alta

---

## 🎯 OBJETIVO GERAL

Criar um módulo completo para gestão de exames ocupacionais e geração inteligente de PCMSO (Programa de Controle Médico de Saúde Ocupacional) com:

- Cadastro completo de exames/procedimentos
- Regras de exigência por risco e por cargo
- Periodicidade inteligente conforme NR-7
- Sistema de versões do PCMSO (imutável após assinatura)
- IA assistiva (sugestões, não imposições)
- Segurança jurídica e auditoria completa

---

## 🏗️ ARQUITETURA DO MÓDULO

### Camadas

```
1. DATA LAYER (Prisma)
   ├── Examinations (catálogo de exames)
   ├── ExamRuleByRisk (regras por risco)
   ├── ExamRuleByJob (regras por cargo)
   ├── PCMSOVersion (versões documentadas)
   ├── PCMSOExamRequirement (exames consolidados)
   └── PCMSOEditHistory (auditoria)

2. SERVICE LAYER
   ├── ExaminationService (CRUD exames)
   ├── RiskExamRulesService (regras por risco)
   ├── JobExamRulesService (regras por cargo)
   ├── PCMSORuleEngineService (motor de regras NR-7)
   ├── PCMSOGeneratorService (geração de versões)
   └── PCMSOAIEditorService (IA assistiva)

3. CONTROLLER LAYER
   ├── ExaminationController
   ├── ExamRulesController
   └── PCMSOController

4. DTO LAYER
   ├── Validation DTOs
   ├── Response DTOs
   └── Query DTOs
```

---

## 📊 MODELOS DE DADOS

### 1. Examination

**Propósito:** Catálogo principal de exames ocupacionais

**Campos:**
- `id`: string (CUID)
- `name`: string (único)
- `description`: string (opcional)
- `category`: ExamCategory (enum)
- `table27Codes`: string[] (códigos eSocial)
- `insertIntoASO`: boolean (padrão: true)
- `requiresJustification`: boolean (padrão: false)
- `active`: boolean (padrão: true)

**Regras de Negócio:**
- Nome único em todo o sistema
- Se código "9999 - Outros" for usado, descrição é obrigatória
- Não pode ser deletado se vinculado a regras ativas
- Soft delete preserva histórico

### 2. ExamRuleByRisk

**Propósito:** Define quando um exame é necessário baseado em um risco

**Campos:**
- `riskId` + `examId` (unique constraint)
- `periodicityType`: PeriodicityType (enum)
- `periodicityValue`: number (meses)
- `periodicityAdvancedRule`: JSON (regras complexas)
- `applicable*`: 5 booleans (admission, dismissal, return, change, periodic)
- `justification`: string
- `aiRecommendation`: string (gerado por IA)
- `notes`: string

**Regras de Negócio:**
- Um risco pode ter múltiplos exames
- Um exame pode ser aplicado a múltiplos riscos
- Periodicidade pode ser sobrescrita pelo cargo
- IA sugere baseado em NR-7, mas usuário decide

### 3. ExamRuleByJob

**Propósito:** Define exames específicos para um cargo

**Campos:**
- Mesmos campos que ExamRuleByRisk
- **Adicional:** `overrideRiskRules`: boolean
- **Adicional:** `insertIntoASO`: boolean

**Regras de Negócio:**
- Se `overrideRiskRules = true`, ignora regras de risco
- Consolidação: Job rules > Risk rules
- Permite customização total por cargo

### 4. PCMSOVersion

**Propósito:** Versão documentada e assinada do PCMSO

**Campos:**
- `companyId` + `versionNumber` (unique)
- `status`: PCMSOStatus (DRAFT | UNDER_REVIEW | SIGNED | ARCHIVED | OUTDATED)
- `title`: string
- `contentHtml`: string (conteúdo editável)
- `generatedByAI`: boolean
- `signedAt`: DateTime (nullable)
- `signedByUserId`: string (nullable)
- `signatureHash`: string (SHA256 para integridade)
- `diffFromPrevious`: JSON (mudanças detectadas)
- `mappingChangedAfterSign`: boolean

**Regras de Negócio CRÍTICAS:**
- **IMUTÁVEL após assinatura** (status = SIGNED)
- Qualquer alteração cria nova versão (v+1) como DRAFT
- Hash SHA256 garante integridade jurídica
- Diff automático entre versões
- Se mapeamento mudar após sign → marca OUTDATED

### 5. PCMSOExamRequirement

**Propósito:** Exames consolidados que compõem uma versão do PCMSO

**Campos:**
- `pcmsoVersionId` + `examId`
- `source`: ExamSourceType (RISK | JOB | MANUAL | AI_SUGGESTION | NR7_REQUIREMENT)
- `sourceRiskId`: string (opcional)
- `sourceJobId`: string (opcional)
- Periodicidade consolidada
- Aplicabilidade consolidada

**Regras de Negócio:**
- Snapshot dos exames no momento da versão
- Registra origem (rastreabilidade)
- Consolidação de regras de risco + cargo
- Permite adições manuais

### 6. PCMSOEditHistory

**Propósito:** Auditoria completa de todas alterações

**Campos:**
- `pcmsoVersionId` + `userId`
- `action`: string (CREATE | EDIT_CONTENT | ADD_EXAM | REMOVE_EXAM | SIGN | ARCHIVE)
- `fieldChanged`: string
- `oldValue` + `newValue`: strings
- `changeContext`: JSON
- `ipAddress` + `userAgent`: strings

**Regras de Negócio:**
- Log imutável de todas ações
- Rastreamento de quem fez o quê
- Evidência jurídica
- Timestamp de cada ação

---

## 🎓 ENUMS

```typescript
enum ExamCategory {
  CLINICAL              // Exame clínico
  LABORATORY            // Laboratorial
  IMAGING               // Imagem
  COMPLEMENTARY         // Complementar
  PSYCHOSOCIAL          // Psicossocial
  FUNCTIONAL            // Funcional
  OTHER                 // Outros
}

enum PeriodicityType {
  NONE                  // Sem periodicidade
  ON_ADMISSION          // Admissional
  ON_DISMISSAL          // Demissional
  ON_RETURN             // Retorno
  ON_CHANGE             // Mudança de risco
  PERIODIC              // Periódico
  CUSTOM                // Customizado
}

enum ExamSourceType {
  RISK                  // De risco
  JOB                   // De cargo
  MANUAL                // Manual
  AI_SUGGESTION         // IA
  NR7_REQUIREMENT       // NR-7
}

enum PCMSOStatus {
  DRAFT                 // Rascunho
  UNDER_REVIEW          // Em revisão
  SIGNED                // Assinado
  ARCHIVED              // Arquivado
  OUTDATED              // Desatualizado
}
```

---

## 🔧 SERVIÇOS

### ExaminationService

**Responsabilidades:**
- CRUD completo de exames
- Busca e filtros
- Validação de códigos tabela 27
- Soft delete

**Métodos Principais:**
```typescript
create(data: CreateExaminationDto): Promise<Examination>
findAll(filters?: ExamFiltersDto): Promise<Examination[]>
findOne(id: string): Promise<Examination>
update(id: string, data: UpdateExaminationDto): Promise<Examination>
remove(id: string): Promise<void> // soft delete
search(term: string): Promise<Examination[]>
validateTable27Codes(codes: string[]): Promise<boolean>
```

### RiskExamRulesService

**Responsabilidades:**
- Gerenciar regras de exames por risco
- Sugestões de IA baseadas em NR-7
- Consolidação de exames

**Métodos Principais:**
```typescript
createRule(data: CreateRiskExamRuleDto): Promise<ExamRuleByRisk>
updateRule(id: string, data: UpdateRiskExamRuleDto): Promise<ExamRuleByRisk>
deleteRule(id: string): Promise<void>
getRulesByRisk(riskId: string): Promise<ExamRuleByRisk[]>
getSuggestedExamsForRisk(riskId: string): Promise<AIExamSuggestion[]>
```

### JobExamRulesService

**Responsabilidades:**
- Gerenciar regras de exames por cargo
- Consolidar regras de risco + cargo
- Resolver conflitos (cargo > risco)

**Métodos Principais:**
```typescript
createRule(data: CreateJobExamRuleDto): Promise<ExamRuleByJob>
updateRule(id: string, data: UpdateJobExamRuleDto): Promise<ExamRuleByJob>
deleteRule(id: string): Promise<void>
getRulesByJob(jobId: string): Promise<ExamRuleByJob[]>
consolidateRules(jobId: string): Promise<ConsolidatedExamRule[]>
getPeriodicSuggestedExams(jobId: string): Promise<ExamSuggestion[]>
```

### PCMSORuleEngineService

**Responsabilidades:**
- Motor de regras NR-7
- Cálculo de periodicidade mínima
- Validações legais
- Avisos e alertas

**Métodos Principais:**
```typescript
calculateMinimumPeriodicity(risk: Risk, workerAge?: number): number
validateClinicalExamRequirement(job: Job): ValidationResult
checkNR7Compliance(examRules: ExamRule[]): ComplianceReport
getWarningsForJob(jobId: string): Warning[]
```

### PCMSOGeneratorService

**Responsabilidades:**
- Detectar mudanças no mapeamento
- Gerar drafts automáticos
- Consolidar todas as regras
- Assinar versões
- Gerar diffs

**Métodos Principais:**
```typescript
detectChanges(companyId: string): Promise<ChangeDetectionResult>
generateDraft(companyId: string, options?: GenerationOptions): Promise<PCMSOVersion>
signVersion(versionId: string, userId: string): Promise<PCMSOVersion>
regenerateIfRulesChanged(companyId: string): Promise<PCMSOVersion | null>
getDiff(oldVersionId: string, newVersionId: string): Promise<PCMSODiff>
```

### PCMSOAIEditorService

**Responsabilidades:**
- Sugestões de texto via IA
- Reescrita assistida
- Justificativas automáticas
- Templates inteligentes

**Métodos Principais:**
```typescript
suggestText(context: AIContext, instruction: string): Promise<string>
rewriteSection(text: string, style: 'formal' | 'simplified' | 'technical'): Promise<string>
generateJustification(exam: Examination, risk: Risk): Promise<string>
summarizeChanges(diff: PCMSODiff): Promise<string>
```

---

## 🌐 ENDPOINTS REST

### Examinations

```
POST   /exams                           # Criar exame
GET    /exams                           # Listar todos
GET    /exams/search?q=audiometria     # Buscar
GET    /exams/:id                       # Buscar por ID
PATCH  /exams/:id                       # Atualizar
DELETE /exams/:id                       # Soft delete
GET    /exams/table27                   # Listar códigos tabela 27
POST   /exams/:id/validate-table27     # Validar códigos
```

### Exam Rules (Risk)

```
POST   /risk-exams                      # Criar regra
GET    /risk-exams/risk/:riskId         # Listar por risco
GET    /risk-exams/:id                  # Buscar por ID
PATCH  /risk-exams/:id                  # Atualizar
DELETE /risk-exams/:id                  # Deletar
GET    /risk-exams/risk/:riskId/suggestions  # Sugestões IA
```

### Exam Rules (Job)

```
POST   /job-exams                       # Criar regra
GET    /job-exams/job/:jobId            # Listar por cargo
GET    /job-exams/job/:jobId/consolidated  # Consolidado (risk + job)
GET    /job-exams/:id                   # Buscar por ID
PATCH  /job-exams/:id                   # Atualizar
DELETE /job-exams/:id                   # Deletar
GET    /job-exams/job/:jobId/periodic-suggestions  # Sugestões periódicas
```

### PCMSO

```
POST   /pcmso/:companyId/detect-changes        # Detectar mudanças
POST   /pcmso/:companyId/generate-draft        # Gerar draft
GET    /pcmso/:companyId/current               # Versão atual
GET    /pcmso/:companyId/versions              # Todas versões
GET    /pcmso/:companyId/versions/:versionId   # Versão específica
POST   /pcmso/:companyId/versions/:versionId/sign      # Assinar
PATCH  /pcmso/:companyId/versions/:versionId/content   # Editar conteúdo
GET    /pcmso/:companyId/versions/:v1/diff/:v2 # Diff entre versões
POST   /pcmso/:companyId/versions/:versionId/ai-edit   # IA assistida
GET    /pcmso/:companyId/versions/:versionId/audit     # Histórico
```

---

## 🧠 INTELIGÊNCIA ASSISTIDA (IA)

### Princípios

1. **NUNCA automática** - Sempre sugestões opt-in
2. **Explicável** - IA justifica suas recomendações
3. **Editável** - Usuário pode ajustar tudo
4. **Rastreável** - Todas sugestões são logadas

### Casos de Uso da IA

#### 1. Sugerir Exames para Risco

```typescript
Input: Risk { type: "PHYSICAL", name: "Ruído" }
Output: [
  {
    exam: "Audiometria",
    periodicity: 12, // meses
    justification: "NR-7 item 7.4.2 - Obrigatório para exposição a ruído > 85dB",
    confidence: 0.95
  }
]
```

#### 2. Calcular Periodicidade Inteligente

```typescript
Input: {
  risk: "Chemical exposure",
  workerAge: 52,
  exposureLevel: "HIGH"
}
Output: {
  suggestedPeriodicity: 6, // meses (ao invés de 12)
  reason: "NR-7 recomenda periodicidade reduzida para trabalhadores >50 anos expostos a agentes químicos"
}
```

#### 3. Gerar Justificativas

```typescript
Input: { exam: "Espirometria", risk: "Poeira de sílica" }
Output: "A espirometria é essencial para detectar precocemente pneumoconioses decorrentes da exposição a sílica cristalina, conforme NR-7 anexo 6. A periodicidade anual permite acompanhamento da função pulmonar e intervenção antes de danos irreversíveis."
```

#### 4. Edição Assistida de PCMSO

```typescript
Input: {
  selectedText: "Os trabalhadores devem fazer exames",
  instruction: "Torne mais formal e técnico"
}
Output: "Os colaboradores expostos aos riscos identificados deverão submeter-se aos exames médicos complementares especificados neste programa, conforme periodicidade estabelecida e em conformidade com a NR-7."
```

---

## 🔒 SEGURANÇA E AUDITORIA

### Imutabilidade

- **PCMSO SIGNED é imutável** - Não pode ser alterado
- Qualquer tentativa de edição gera erro HTTP 423 Locked
- Nova versão deve ser criada como DRAFT

### Integridade

- Hash SHA256 do conteúdo no momento da assinatura
- Verificação de integridade em cada acesso
- Alerta se hash não bate

### Auditoria

Todas as ações são registradas:
- Quem fez
- Quando fez
- O que mudou
- De onde (IP + User Agent)
- Por quê (contexto)

### Versionamento

```
v1 (SIGNED) → imutável
   ↓
Mudança no mapeamento
   ↓
v2 (DRAFT) → editável
   ↓
Assinatura
   ↓
v2 (SIGNED) → imutável
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Modelos e Migração ✅ (Em andamento)
- [x] Criar schema Prisma
- [ ] Adicionar relações aos modelos existentes
- [ ] Executar migração
- [ ] Verificar integridade

### Fase 2: Services Core
- [ ] ExaminationService (CRUD básico)
- [ ] RiskExamRulesService (regras simples)
- [ ] JobExamRulesService (regras simples)

### Fase 3: Services Avançados
- [ ] PCMSORuleEngineService (motor NR-7)
- [ ] PCMSOGeneratorService (geração básica)

### Fase 4: IA
- [ ] PCMSOAIEditorService (sugestões simples)
- [ ] Templates de justificativas
- [ ] Integração com LLM

### Fase 5: Controllers
- [ ] ExaminationController
- [ ] ExamRulesController
- [ ] PCMSOController

### Fase 6: Testes
- [ ] Testes unitários dos services
- [ ] Testes de integração dos endpoints
- [ ] Testes de regras de negócio

### Fase 7: Seed
- [ ] Exames comuns brasileiros
- [ ] Regras exemplo NR-7
- [ ] PCMSO exemplo

---

## 🎯 PRIORIDADES

**P0 - Crítico:**
- Examinations CRUD
- ExamRuleByRisk e ExamRuleByJob
- PCMSOVersion com DRAFT/SIGNED
- Imutabilidade após assinatura

**P1 - Importante:**
- PCMSOGenerator básico
- Consolidação de regras
- Diff entre versões
- Auditoria básica

**P2 - Desejável:**
- IA sugestões
- IA editor de texto
- Templates avançados
- Validações NR-7 completas

---

**Status:** Especificação aprovada - Iniciar implementação
**Próximo Passo:** Integrar schema ao Prisma e criar estrutura de pastas
