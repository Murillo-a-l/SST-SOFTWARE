# Análise do Módulo de Empresas - Sistema SST

## 📋 Resumo Executivo

Análise completa do módulo de empresas incluindo cadastro, documentos e assinaturas. Todas as funcionalidades foram revisadas e a obrigatoriedade dos campos de médico responsável foi removida conforme solicitado.

---

## ✅ Modificações Realizadas

### 1. Campos de Médico Responsável Tornados Opcionais

**Arquivos Modificados:**
- `backend/prisma/schema.prisma` - Campos `medicoNome`, `medicoCrm`, `inicioValidade` e `revisarAte` agora são opcionais (`String?`, `DateTime?`)
- `types.ts` - Interface `Empresa` atualizada com campos opcionais
- `components/modals/EmpresaManagerModal.tsx` - Validação removida e labels atualizadas para "Configuração PCMSO (Opcional)"
- Migration SQL criada em `backend/prisma/migrations/20250114_make_pcmso_fields_optional/`

**Impacto:**
- Empresas podem ser cadastradas sem informações de PCMSO
- Facilita cadastro inicial de empresas que ainda não possuem médico responsável

---

## 🔍 Análise Detalhada do Módulo

### 1. Cadastro de Empresas (`EmpresaManagerModal`)

**Funcionalidades Atuais:**
- ✅ Integração com BrasilAPI para busca automática de dados por CNPJ
- ✅ Formatação automática de CNPJ e telefone
- ✅ Suporte a relacionamento matriz/filial
- ✅ Validação de CNPJ único
- ✅ Campos organizados em 3 seções: Dados da Empresa, Financeiro/Contato, PCMSO
- ✅ Persistência via API backend (PostgreSQL)

**Campos Obrigatórios:**
- Razão Social
- Nome Fantasia
- CNPJ

**Campos Opcionais:**
- Endereço
- Empresa Matriz
- Contato (Nome, Email, Telefone)
- Dia Padrão de Vencimento
- Médico Responsável e CRM
- Datas de Validade PCMSO

**Fluxo de Dados:**
```
Frontend (EmpresaManagerModal)
  → apiService.empresaApi.create/update()
    → Backend (empresa.controller.ts)
      → Prisma ORM
        → PostgreSQL (tabela empresas)
```

---

### 2. Gerenciamento de Documentos (`GerenciadorDocumentos`)

**Funcionalidades Atuais:**
- ✅ Sistema de pastas hierárquicas (navegação em árvore)
- ✅ Upload de documentos em Base64
- ✅ Suporte a múltiplos tipos de documento (configurável)
- ✅ Controle de validade com 4 estados:
  - **ATIVO**: Documento válido
  - **VENCENDO**: Dentro do período de alerta
  - **VENCIDO**: Data de validade ultrapassada
  - **ENCERRADO**: Documento manualmente encerrado
- ✅ Ícones diferenciados por tipo de arquivo (PDF, imagens, DOC, XLS, ZIP)
- ✅ Menu de ações contextuais (Editar, Download, Alterar Status, Excluir)
- ✅ Documentos sensíveis com controle de acesso

**Fluxo de Documentos:**
```
1. Usuário faz upload do arquivo
2. Arquivo convertido para Base64
3. Salvo no localStorage (pendente migração para backend)
4. Status calculado automaticamente com base nas datas
```

---

### 3. Sistema de Assinaturas (`DocumentoManagerModal` + `AssinaturaDocumentoModal`)

**Funcionalidades Atuais:**
- ✅ 4 estados de assinatura:
  - **NAO_REQUER**: Documento não precisa de assinatura
  - **PENDENTE**: Aguardando assinatura de usuário designado
  - **ASSINADO**: Documento assinado e aprovado
  - **REJEITADO**: Assinatura rejeitada
- ✅ Designação de responsável pela assinatura
- ✅ Controle de permissões (apenas usuário designado pode assinar)
- ✅ Armazenamento de versão assinada separada (`arquivoAssinadoBase64`)
- ✅ Notificações para assinaturas pendentes

**Fluxo de Assinatura:**
```
1. Documento criado com statusAssinatura = 'PENDENTE'
2. requerAssinaturaDeId define usuário responsável
3. Usuário acessa modal de assinatura
4. Aprova/rejeita documento
5. Status atualizado e versão assinada salva (se aprovado)
```

---

### 4. Backend (API REST)

**Endpoints Disponíveis:**
```
GET    /api/empresas          - Lista todas as empresas (com relacionamentos)
GET    /api/empresas/:id      - Busca empresa por ID
POST   /api/empresas          - Cria nova empresa (requer ADMIN)
PUT    /api/empresas/:id      - Atualiza empresa (requer ADMIN)
DELETE /api/empresas/:id      - Soft delete de empresa (requer ADMIN)
```

**Segurança:**
- ✅ Autenticação JWT obrigatória
- ✅ Autorização baseada em roles (ADMIN para criar/editar/excluir)
- ✅ Validação de dados
- ✅ Soft delete (registros não são removidos do banco)

**Relacionamentos:**
```
Empresa
  ├── matriz (Empresa?)
  ├── filiais (Empresa[])
  ├── funcionarios (Funcionario[])
  ├── pastas (Pasta[])
  ├── documentos (DocumentoEmpresa[])
  ├── servicosPrestados (ServicoPrestado[])
  ├── cobrancas (Cobranca[])
  └── nfes (NFe[])
```

---

## 💡 Sugestões de Melhorias

### 🔥 PRIORIDADE ALTA

#### 1. **Migrar Documentos e Pastas para Backend/PostgreSQL**
**Status Atual:** Documentos ainda usam localStorage
**Benefícios:**
- Persistência confiável
- Backup automático
- Compartilhamento entre dispositivos
- Melhor segurança para documentos sensíveis
- Suporte a arquivos maiores via storage externo (AWS S3, etc.)

**Implementação Sugerida:**
```typescript
// Backend: Criar endpoints
POST   /api/empresas/:empresaId/documentos
GET    /api/empresas/:empresaId/documentos
PUT    /api/documentos/:id
DELETE /api/documentos/:id
GET    /api/documentos/:id/download

// Considerar: Armazenar arquivos grandes em S3 e salvar apenas URL no banco
```

**Estimativa:** 6-8 horas

---

#### 2. **Implementar Sistema de Busca Avançada de Empresas**
**Problema:** Busca atual é apenas por nome/CNPJ local
**Solução:**
- Busca full-text no backend
- Filtros por:
  - Status PCMSO (válido, vencido, vencendo)
  - Tipo (Matriz/Filial)
  - Documentos pendentes
  - Funcionários cadastrados
  - Período de cadastro

**Implementação Sugerida:**
```typescript
// Backend
GET /api/empresas?search=termo&tipo=matriz&pcmsoStatus=vencido&hasDocumentosPendentes=true

// Frontend: Adicionar componente de filtros avançados
<FiltrosAvancadosEmpresas onFilter={handleFilter} />
```

**Estimativa:** 4-6 horas

---

#### 3. **Validação Automática de CNPJ com Receita Federal**
**Problema:** BrasilAPI pode estar desatualizada
**Solução:**
- Validar CNPJ com Receita Federal usando API oficial
- Verificar situação cadastral (Ativa/Suspensa/Inapta)
- Alertar se empresa está inativa

**Implementação Sugerida:**
```typescript
// Backend: Criar serviço de validação
async function validarCNPJReceita(cnpj: string): Promise<{
  valid: boolean;
  situacao: 'ATIVA' | 'SUSPENSA' | 'INAPTA';
  motivoSituacao: string;
}> {
  // Integração com API oficial
}
```

**Estimativa:** 3-4 horas

---

### ⭐ PRIORIDADE MÉDIA

#### 4. **Dashboard de Vencimentos PCMSO**
**Funcionalidade:** Visualização gráfica dos vencimentos de PCMSO
**Benefícios:**
- Alerta proativo de vencimentos
- Gráfico de timeline
- Lista de empresas que precisam renovação

**Implementação Sugerida:**
```typescript
// Componente: PCMSOVencimentosWidget
- Gráfico de barras: empresas por status (válido, vencendo, vencido)
- Lista ordenada por data de vencimento
- Ação rápida para editar empresa
```

**Estimativa:** 4-5 horas

---

#### 5. **Histórico de Alterações (Audit Log)**
**Problema:** Não há rastreamento de mudanças
**Solução:**
- Tabela `audit_log` no banco
- Registrar: quem alterou, quando, campo modificado, valor anterior/novo
- Interface para consulta de histórico

**Implementação Sugerida:**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id INT,
  user_id INT,
  action VARCHAR(20),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Estimativa:** 6-8 horas

---

#### 6. **Importação em Massa de Empresas via Planilha**
**Funcionalidade:** Upload de Excel/CSV para cadastro em lote
**Benefícios:**
- Migração de sistemas antigos facilitada
- Cadastro rápido de múltiplas empresas

**Implementação Sugerida:**
```typescript
// Modal: ImportarEmpresasModal
- Upload de arquivo XLSX/CSV
- Mapeamento de colunas
- Validação prévia (CNPJs duplicados, etc.)
- Preview antes de importar
- Relatório de importação (sucessos/erros)
```

**Estimativa:** 8-10 horas

---

#### 7. **Sistema de Tags/Categorias para Empresas**
**Funcionalidade:** Marcar empresas com tags customizadas
**Exemplos de Tags:**
- "Cliente VIP"
- "Pagamento em Dia"
- "Renovação Urgente"
- "Auditoria Pendente"

**Implementação Sugerida:**
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  cor VARCHAR(7)
);

CREATE TABLE empresa_tags (
  empresa_id INT,
  tag_id INT,
  PRIMARY KEY (empresa_id, tag_id)
);
```

**Estimativa:** 5-6 horas

---

### 💡 PRIORIDADE BAIXA (Nice to Have)

#### 8. **Integração com Google Drive/Dropbox para Documentos**
**Funcionalidade:** Sincronizar documentos com cloud storage
**Benefícios:**
- Economia de espaço no banco
- Versionamento automático
- Compartilhamento facilitado

**Estimativa:** 10-12 horas

---

#### 9. **Assinatura Digital com Certificado ICP-Brasil**
**Funcionalidade:** Assinatura digital válida juridicamente
**Benefícios:**
- Validade jurídica de ASO, PCMSO
- Conformidade com NR-7

**Estimativa:** 15-20 horas (complexidade alta)

---

#### 10. **Gráfico de Relacionamento Matriz-Filiais**
**Funcionalidade:** Visualização em árvore/grafo das empresas
**Benefícios:**
- Visão clara da hierarquia
- Navegação intuitiva entre matriz e filiais

**Implementação Sugerida:**
```typescript
// Usar biblioteca como react-flow ou vis.js
<OrgChartEmpresas empresas={empresas} />
```

**Estimativa:** 6-8 horas

---

#### 11. **Exportação de Relatórios de Empresas**
**Formatos:** PDF, Excel, CSV
**Conteúdo:**
- Lista de empresas com filtros
- Documentos vencidos por empresa
- Status PCMSO consolidado

**Estimativa:** 5-7 horas

---

#### 12. **Notificações por Email/WhatsApp**
**Funcionalidade:** Alertas automáticos de:
- Vencimento de PCMSO
- Documentos pendentes de assinatura
- Novos documentos disponíveis

**Implementação Sugerida:**
```typescript
// Backend: Serviço de notificações
- Integração com SendGrid (email)
- Integração com Twilio (WhatsApp)
- Configuração de preferências por usuário
```

**Estimativa:** 10-12 horas

---

## 🐛 Problemas Identificados e Correções Sugeridas

### 1. **Inconsistência entre localStorage e Backend**
**Problema:** Documentos, pastas, PCMSO, financeiro ainda em localStorage
**Solução:** Priorizar migração completa para backend (veja sugestão #1)

### 2. **Falta de Loading Spinners**
**Problema:** Estado `isLoading` existe mas sem feedback visual
**Solução:** Implementar componente `LoadingSpinner` nas operações assíncronas

**Código Sugerido:**
```typescript
// Em EmpresaManagerModal
{isSaving && <LoadingSpinner message="Salvando empresa..." />}

// Em GerenciadorDocumentos
{isLoadingDocuments && <LoadingSpinner message="Carregando documentos..." />}
```

### 3. **Uso de `alert()` ao invés de `toast`**
**Problema:** Alguns lugares ainda usam `alert()` nativo
**Solução:** Substituir por `react-hot-toast` (já instalado)

**Buscar e Substituir:**
```bash
# Encontrar todos os alerts
grep -r "alert(" components/ --include="*.tsx"

# Substituir por toast.error() ou toast.success()
```

---

## 📊 Métricas de Qualidade do Código

### Pontos Positivos ✅
- Separação clara de responsabilidades (controller, service, API)
- Uso de TypeScript com tipagem forte
- Validações adequadas no frontend e backend
- Soft delete implementado (dados nunca são perdidos)
- Autenticação e autorização robustas
- Código modular e reutilizável

### Pontos de Atenção ⚠️
- Arquivos grandes (EmpresaManagerModal com 288 linhas)
  - **Sugestão:** Extrair seções em componentes menores
- Duplicação de lógica de formatação (CNPJ, telefone)
  - **Sugestão:** Criar utils/formatters.ts
- Falta de testes automatizados
  - **Sugestão:** Implementar testes unitários com Jest + React Testing Library

---

## 🎯 Roadmap Sugerido (Ordem de Implementação)

### Sprint 1 (1-2 semanas)
1. ✅ Remover obrigatoriedade de médico responsável (CONCLUÍDO)
2. Migrar documentos e pastas para backend
3. Implementar loading spinners
4. Substituir alerts por toasts

### Sprint 2 (1-2 semanas)
5. Sistema de busca avançada
6. Dashboard de vencimentos PCMSO
7. Validação CNPJ com Receita Federal

### Sprint 3 (2-3 semanas)
8. Histórico de alterações (audit log)
9. Importação em massa via planilha
10. Sistema de tags/categorias

### Sprint 4 (Futuro)
11. Exportação de relatórios
12. Notificações por email/WhatsApp
13. Integrações com cloud storage

---

## 📝 Notas Finais

O módulo de empresas está **bem estruturado e funcional**. A arquitetura é sólida e permite extensões futuras. As principais melhorias sugeridas focam em:

1. **Completar a migração para backend** (documentos, PCMSO, financeiro)
2. **Melhorar UX** (loading, toasts, busca avançada)
3. **Adicionar inteligência** (validações automáticas, notificações)
4. **Escalabilidade** (audit log, importação em massa)

**Recomendação:** Focar primeiro nas melhorias de **Prioridade Alta** (#1, #2, #3) antes de implementar novos recursos.

---

## 🔧 Comandos para Aplicar Mudanças Realizadas

```bash
# 1. Navegar para o backend
cd backend

# 2. Aplicar migration (tornar campos opcionais)
# ATENÇÃO: Certifique-se de ter backup do banco antes!
psql -U postgres -d occupational_health -f prisma/migrations/20250114_make_pcmso_fields_optional/migration.sql

# 3. Regenerar Prisma Client
npm run prisma:generate

# 4. Reiniciar backend
npm run dev

# 5. Em outro terminal, reiniciar frontend
cd ..
npm run dev
```

---

**Análise realizada em:** 2025-11-14
**Autor:** Claude Code
**Status:** ✅ Completa
