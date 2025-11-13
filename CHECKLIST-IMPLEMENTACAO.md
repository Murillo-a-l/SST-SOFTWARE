# Checklist de Implementação - Sistema de Gestão de Saúde Ocupacional

**Status do Projeto:** ⚠️ NÃO PRONTO PARA PRODUÇÃO

Este documento lista todas as melhorias, correções e implementações necessárias para tornar o sistema production-ready.

---

## 🔴 PRIORIDADE CRÍTICA - Segurança

### Autenticação e Autorização
- [ ] **Implementar backend de autenticação com JWT**
  - [ ] Criar endpoints de login/logout
  - [ ] Implementar refresh tokens
  - [ ] Adicionar expiração de sessão
  - [ ] Implementar rate limiting

- [ ] **Hash de senhas com bcrypt/argon2**
  - [ ] Remover senhas em texto plano do código
  - [ ] Migrar senhas existentes
  - [ ] Implementar política de senhas fortes
  - [ ] Adicionar recuperação de senha

- [ ] **Implementar controle de acesso baseado em roles (RBAC)**
  - [ ] Definir permissões por role (admin, user, viewer)
  - [ ] Proteger rotas sensíveis
  - [ ] Validar permissões no backend
  - [ ] Implementar auditoria de ações

### Proteção de Dados
- [ ] **Criptografar dados sensíveis**
  - [ ] Criptografar CPF no banco de dados
  - [ ] Criptografar dados médicos
  - [ ] Implementar criptografia em trânsito (HTTPS)
  - [ ] Adicionar criptografia para backups

- [ ] **Validação e sanitização de inputs**
  - [ ] Implementar validação no backend (Zod/Joi)
  - [ ] Sanitizar inputs contra XSS
  - [ ] Validar tipos de arquivo no upload
  - [ ] Implementar limitação de tamanho de arquivo
  - [ ] Adicionar proteção CSRF

- [ ] **Gerenciamento seguro de API keys**
  - [ ] Mover GEMINI_API_KEY para variáveis de ambiente do servidor
  - [ ] Implementar rotação de chaves
  - [ ] Adicionar .env.local ao .gitignore
  - [ ] Usar secrets manager em produção

### Segurança de Arquivos
- [ ] **Validação de uploads**
  - [ ] Validar tipos MIME
  - [ ] Implementar limite de 10MB por arquivo
  - [ ] Escanear arquivos por malware
  - [ ] Gerar nomes únicos para arquivos
  - [ ] Armazenar arquivos fora do webroot

---

## 🔴 PRIORIDADE CRÍTICA - Backend Implementation

### Infraestrutura do Backend
- [ ] **Setup inicial do backend**
  - [ ] Configurar Node.js + Express/Fastify
  - [ ] Configurar TypeScript
  - [ ] Configurar ESLint + Prettier
  - [ ] Adicionar variáveis de ambiente (.env)

- [ ] **Configurar banco de dados**
  - [ ] Escolher banco (PostgreSQL recomendado)
  - [ ] Configurar Prisma ORM
  - [ ] Criar schema do banco baseado em types.ts
  - [ ] Implementar sistema de migrations
  - [ ] Configurar connection pooling
  - [ ] Adicionar índices para performance

### API REST
- [ ] **Endpoints de Autenticação**
  - [ ] POST /api/auth/login
  - [ ] POST /api/auth/logout
  - [ ] POST /api/auth/refresh
  - [ ] POST /api/auth/forgot-password
  - [ ] POST /api/auth/reset-password
  - [ ] GET /api/auth/me

- [ ] **Endpoints de Empresas**
  - [ ] GET /api/empresas (com paginação)
  - [ ] GET /api/empresas/:id
  - [ ] POST /api/empresas
  - [ ] PUT /api/empresas/:id
  - [ ] DELETE /api/empresas/:id
  - [ ] GET /api/empresas/:id/filiais

- [ ] **Endpoints de Funcionários**
  - [ ] GET /api/funcionarios (com filtros e paginação)
  - [ ] GET /api/funcionarios/:id
  - [ ] POST /api/funcionarios
  - [ ] PUT /api/funcionarios/:id
  - [ ] DELETE /api/funcionarios/:id (soft delete)
  - [ ] POST /api/funcionarios/import (Excel)
  - [ ] GET /api/funcionarios/export
  - [ ] POST /api/funcionarios/merge (mesclar duplicatas)

- [ ] **Endpoints de Exames**
  - [ ] GET /api/exames
  - [ ] GET /api/exames/:id
  - [ ] POST /api/exames
  - [ ] PUT /api/exames/:id
  - [ ] DELETE /api/exames/:id
  - [ ] GET /api/funcionarios/:id/exames

- [ ] **Endpoints de Documentos**
  - [ ] GET /api/documentos (com filtros)
  - [ ] GET /api/documentos/:id
  - [ ] POST /api/documentos (upload)
  - [ ] PUT /api/documentos/:id
  - [ ] DELETE /api/documentos/:id
  - [ ] GET /api/documentos/:id/download
  - [ ] POST /api/documentos/:id/solicitar-assinatura
  - [ ] POST /api/documentos/:id/assinar
  - [ ] POST /api/documentos/:id/rejeitar

- [ ] **Endpoints de PCMSO**
  - [ ] GET /api/pcmso/cargos
  - [ ] POST /api/pcmso/cargos
  - [ ] GET /api/pcmso/ambientes
  - [ ] POST /api/pcmso/ambientes
  - [ ] GET /api/pcmso/riscos
  - [ ] POST /api/pcmso/riscos
  - [ ] GET /api/pcmso/exames
  - [ ] POST /api/pcmso/exames
  - [ ] GET /api/pcmso/protocolos
  - [ ] POST /api/pcmso/protocolos

- [ ] **Endpoints Financeiros**
  - [ ] GET /api/financeiro/catalogo-servicos
  - [ ] POST /api/financeiro/catalogo-servicos
  - [ ] GET /api/financeiro/servicos-prestados
  - [ ] POST /api/financeiro/servicos-prestados
  - [ ] GET /api/financeiro/cobrancas
  - [ ] POST /api/financeiro/cobrancas
  - [ ] PUT /api/financeiro/cobrancas/:id/status
  - [ ] GET /api/financeiro/nfes
  - [ ] POST /api/financeiro/nfes
  - [ ] POST /api/financeiro/nfes/:id/enviar

- [ ] **Endpoints de Relatórios**
  - [ ] POST /api/relatorios/exames (gerar PDF)
  - [ ] POST /api/relatorios/documentos (gerar PDF)
  - [ ] POST /api/relatorios/pcmso (gerar PCMSO completo)
  - [ ] GET /api/relatorios/estatisticas

- [ ] **Endpoints de Sistema**
  - [ ] GET /api/health
  - [ ] POST /api/backup/export
  - [ ] POST /api/backup/import
  - [ ] GET /api/notificacoes
  - [ ] PUT /api/notificacoes/:id/marcar-lida

### Serviços Backend
- [ ] **Serviço de Email**
  - [ ] Configurar SMTP ou serviço (SendGrid, AWS SES)
  - [ ] Template de boas-vindas
  - [ ] Template de recuperação de senha
  - [ ] Template de notificação de exame vencido
  - [ ] Template de solicitação de assinatura

- [ ] **Serviço de Storage**
  - [ ] Implementar upload para S3/CloudStorage
  - [ ] Gerar URLs assinadas temporárias
  - [ ] Implementar limpeza de arquivos órfãos

- [ ] **Serviço de PDF**
  - [ ] Implementar geração de relatórios (PDFKit ou Puppeteer)
  - [ ] Templates para ASO, PCMSO, PGR
  - [ ] Adicionar marca d'água opcional

- [ ] **Serviço de Integração NFe**
  - [ ] Integrar com API da prefeitura/SEFAZ
  - [ ] Gerar XML NFe
  - [ ] Enviar NFe
  - [ ] Consultar status
  - [ ] Armazenar XML e PDF retornados

### Middleware
- [ ] **Implementar middlewares essenciais**
  - [ ] Autenticação JWT
  - [ ] Validação de role
  - [ ] Rate limiting
  - [ ] Request logging
  - [ ] Error handling global
  - [ ] CORS configuration
  - [ ] Helmet para headers de segurança
  - [ ] Compressão de resposta

---

## 🟠 PRIORIDADE ALTA - Migração de Dados

### Migração de localStorage para Banco de Dados
- [ ] **Criar script de migração**
  - [ ] Exportar dados do localStorage
  - [ ] Validar integridade dos dados
  - [ ] Transformar para schema do banco
  - [ ] Importar para PostgreSQL
  - [ ] Validar migração

- [ ] **Atualizar frontend**
  - [ ] Remover dbService.ts (localStorage)
  - [ ] Criar apiService.ts (HTTP client)
  - [ ] Implementar chamadas à API
  - [ ] Adicionar loading states
  - [ ] Implementar tratamento de erros HTTP

- [ ] **Implementar sincronização**
  - [ ] Polling para atualizações
  - [ ] WebSockets para real-time (opcional)
  - [ ] Offline support (opcional)

### Integridade Referencial
- [ ] **Adicionar constraints no banco**
  - [ ] Foreign keys
  - [ ] Unique constraints
  - [ ] Check constraints
  - [ ] Cascade deletes onde apropriado

- [ ] **Implementar soft deletes**
  - [ ] Adicionar deleted_at em todas as tabelas
  - [ ] Atualizar queries para ignorar deletados
  - [ ] Criar endpoint para restaurar

---

## 🟠 PRIORIDADE ALTA - Testes

### Setup de Testes
- [ ] **Configurar ambiente de testes**
  - [ ] Instalar Jest + Testing Library
  - [ ] Configurar coverage report
  - [ ] Configurar test database
  - [ ] Adicionar scripts npm test, test:watch, test:coverage

- [ ] **Configurar CI/CD**
  - [ ] GitHub Actions ou GitLab CI
  - [ ] Rodar testes automaticamente
  - [ ] Verificar coverage mínimo (70%)
  - [ ] Lint e type check

### Testes Unitários
- [ ] **Serviços (Backend)**
  - [ ] Testar todas as funções do dbService
  - [ ] Testar validações
  - [ ] Testar cálculos de datas/vencimentos
  - [ ] Testar geração de relatórios
  - [ ] Testar mesclar duplicatas

- [ ] **Utilitários (Frontend)**
  - [ ] Testar formatação de datas
  - [ ] Testar cálculos de status
  - [ ] Testar validações de CPF/CNPJ
  - [ ] Testar helpers de formatação

### Testes de Integração
- [ ] **API Endpoints**
  - [ ] Testar fluxo de autenticação
  - [ ] Testar CRUD de empresas
  - [ ] Testar CRUD de funcionários
  - [ ] Testar upload de documentos
  - [ ] Testar importação de planilha
  - [ ] Testar geração de relatórios
  - [ ] Testar fluxo de assinatura
  - [ ] Testar módulo financeiro

### Testes de Componentes
- [ ] **Componentes críticos**
  - [ ] LoginPage
  - [ ] Dashboard
  - [ ] FuncionariosTab
  - [ ] Todos os modals principais
  - [ ] SearchableSelect
  - [ ] Forms de cadastro

### Testes E2E
- [ ] **Configurar Playwright/Cypress**
  - [ ] Setup inicial
  - [ ] Criar fixtures de dados

- [ ] **Fluxos principais**
  - [ ] Fluxo de login
  - [ ] Cadastro de empresa
  - [ ] Cadastro de funcionário
  - [ ] Registro de exame
  - [ ] Upload de documento
  - [ ] Geração de relatório
  - [ ] Importação de planilha
  - [ ] Fluxo de assinatura digital

---

## 🟠 PRIORIDADE ALTA - Tratamento de Erros

### Error Boundaries
- [ ] **Implementar Error Boundaries React**
  - [ ] ErrorBoundary global
  - [ ] ErrorBoundary por seção
  - [ ] Página de erro amigável
  - [ ] Logging de erros (Sentry)

### Tratamento de Erros
- [ ] **Substituir window.alert()**
  - [ ] Criar componente Toast/Notification
  - [ ] Implementar success messages
  - [ ] Implementar error messages
  - [ ] Implementar warning messages
  - [ ] Adicionar auto-dismiss

- [ ] **Tratamento centralizado**
  - [ ] Criar error handler global
  - [ ] Mapear erros HTTP para mensagens
  - [ ] Logar erros no backend
  - [ ] Criar página 404
  - [ ] Criar página 500

---

## 🟡 PRIORIDADE MÉDIA - Melhorias de UX/UI

### Feedback Visual
- [ ] **Loading States**
  - [ ] Loading em todas as chamadas API
  - [ ] Skeleton screens
  - [ ] Progress bars para uploads
  - [ ] Debounce em buscas

- [ ] **Confirmações**
  - [ ] Melhorar ConfirmationModal com animações
  - [ ] Adicionar undo para ações críticas
  - [ ] Success toast após operações

- [ ] **Navegação**
  - [ ] Adicionar breadcrumbs
  - [ ] Melhorar indicador de página ativa
  - [ ] Adicionar atalhos de teclado
  - [ ] Implementar histórico/back button

### Forms
- [ ] **Validação de formulários**
  - [ ] Validação em tempo real
  - [ ] Mensagens de erro por campo
  - [ ] Highlights em campos inválidos
  - [ ] Desabilitar submit com erros

- [ ] **Melhorias gerais**
  - [ ] Auto-save de rascunhos
  - [ ] Prevenção de perda de dados (navegação)
  - [ ] Autocomplete em campos comuns
  - [ ] Máscaras de input (CPF, CNPJ, telefone)

### Responsividade
- [ ] **Mobile-first**
  - [ ] Revisar todos os modals para mobile
  - [ ] Otimizar tabelas para telas pequenas
  - [ ] Aumentar touch targets (mínimo 44x44px)
  - [ ] Testar em dispositivos reais
  - [ ] Implementar menu mobile

### Performance
- [ ] **Otimizações**
  - [ ] Implementar paginação (backend + frontend)
  - [ ] Virtual scrolling para listas grandes
  - [ ] Lazy loading de componentes
  - [ ] Debounce em filtros
  - [ ] Memoização de cálculos pesados
  - [ ] Code splitting por rota
  - [ ] Comprimir imagens
  - [ ] Implementar cache estratégico

---

## 🟡 PRIORIDADE MÉDIA - Acessibilidade (WCAG 2.1 AA)

### Marcação Semântica
- [ ] **HTML semântico**
  - [ ] Substituir divs por tags semânticas
  - [ ] Adicionar landmarks (nav, main, aside)
  - [ ] Corrigir lang="pt-BR" no index.html

- [ ] **ARIA**
  - [ ] Adicionar ARIA labels em ícones
  - [ ] Implementar live regions para notificações
  - [ ] Adicionar aria-describedby em forms
  - [ ] Implementar focus trap em modals
  - [ ] Adicionar aria-expanded em dropdowns

### Navegação por Teclado
- [ ] **Keyboard support**
  - [ ] Testar tab order em todas as páginas
  - [ ] Adicionar skip links
  - [ ] Implementar atalhos (ESC fecha modal, etc)
  - [ ] Focar primeiro campo em modals
  - [ ] Retornar foco após fechar modal

### Contraste e Visual
- [ ] **Verificar contraste de cores**
  - [ ] Auditar com ferramenta (Axe DevTools)
  - [ ] Ajustar cores que falham WCAG AA
  - [ ] Não usar apenas cor para status
  - [ ] Adicionar ícones aos status

- [ ] **Opções de acessibilidade**
  - [ ] Modo de alto contraste
  - [ ] Opção de aumentar fonte
  - [ ] Modo escuro (dark mode)

### Screen Readers
- [ ] **Otimizar para leitores de tela**
  - [ ] Testar com NVDA/JAWS
  - [ ] Anunciar mudanças de conteúdo
  - [ ] Melhorar labels de formulários
  - [ ] Adicionar texto descritivo em ações

---

## 🟡 PRIORIDADE MÉDIA - Funcionalidades Faltantes

### Gestão de Documentos
- [ ] **Completar funcionalidades**
  - [ ] Implementar delete recursivo de pastas
  - [ ] Adicionar edição de pastas
  - [ ] Implementar versionamento de documentos
  - [ ] Adicionar histórico de alterações
  - [ ] Implementar compartilhamento seguro

### PCMSO
- [ ] **Automações**
  - [ ] Sugestão automática de exames por cargo
  - [ ] Geração automática de PCMSO completo
  - [ ] Integração com eSocial
  - [ ] Alertas automáticos de vencimento
  - [ ] Dashboard de compliance

### Módulo Financeiro
- [ ] **Completar implementações**
  - [ ] Geração de XML NFe
  - [ ] Envio para SEFAZ
  - [ ] Rastreamento de pagamentos
  - [ ] Integração com gateway de pagamento
  - [ ] Relatórios financeiros
  - [ ] Exportação para contabilidade
  - [ ] Cálculo automático de impostos

### Relatórios
- [ ] **Expandir opções**
  - [ ] Relatórios customizáveis
  - [ ] Agendamento de relatórios
  - [ ] Envio automático por email
  - [ ] Exportação em múltiplos formatos (PDF, Excel, CSV)
  - [ ] Dashboard analítico
  - [ ] Gráficos interativos

### Notificações
- [ ] **Sistema completo**
  - [ ] Notificações por email
  - [ ] Notificações push (opcional)
  - [ ] Notificações de WhatsApp (opcional)
  - [ ] Centro de notificações melhorado
  - [ ] Preferências de notificação por usuário
  - [ ] Digest semanal/mensal

---

## 🟢 PRIORIDADE BAIXA - Melhorias de Código

### Refatoração
- [ ] **Decompor App.tsx**
  - [ ] Extrair lógica de autenticação
  - [ ] Criar context para dados globais
  - [ ] Separar gerenciamento de modals
  - [ ] Extrair lógica de notificações

- [ ] **Remover duplicação**
  - [ ] Abstrair formatação de datas
  - [ ] Criar hook para modals
  - [ ] Abstrair cálculos de status
  - [ ] Criar componente genérico de tabela

- [ ] **Melhorar type safety**
  - [ ] Remover tipos `any`
  - [ ] Adicionar validações runtime com Zod
  - [ ] Strict mode no TypeScript
  - [ ] Tipar eventos corretamente

### Code Quality
- [ ] **Configurar ferramentas**
  - [ ] ESLint com regras strict
  - [ ] Prettier
  - [ ] Husky para pre-commit hooks
  - [ ] Lint-staged
  - [ ] Commitlint

- [ ] **Documentação de código**
  - [ ] JSDoc em funções complexas
  - [ ] Comentários em lógica de negócio
  - [ ] README para cada módulo
  - [ ] Exemplos de uso

---

## 🟢 PRIORIDADE BAIXA - Documentação

### Documentação de Usuário
- [ ] **Criar guias**
  - [ ] Manual do usuário (PDF)
  - [ ] Guia do administrador
  - [ ] FAQs
  - [ ] Vídeos tutoriais
  - [ ] Tooltips no sistema

### Documentação Técnica
- [ ] **Expandir docs**
  - [ ] Diagramas de arquitetura
  - [ ] Diagramas de fluxo de dados
  - [ ] Diagramas ER do banco
  - [ ] Swagger/OpenAPI para API
  - [ ] Guia de contribuição
  - [ ] Guia de deploy

### Compliance
- [ ] **Documentação regulatória**
  - [ ] Documentar requisitos da NR-7
  - [ ] Documentar requisitos do eSocial
  - [ ] Política de privacidade (LGPD)
  - [ ] Termos de uso
  - [ ] Certificações necessárias

---

## 🟢 PRIORIDADE BAIXA - Features Adicionais

### Integrações
- [ ] **Sistemas externos**
  - [ ] Integração com eSocial
  - [ ] Integração com sistemas de RH
  - [ ] Integração com laboratórios
  - [ ] API pública para terceiros
  - [ ] Webhooks

### Funcionalidades Extras
- [ ] **Nice to have**
  - [ ] Modo offline (PWA)
  - [ ] App mobile (React Native)
  - [ ] Assinatura digital com certificado ICP-Brasil
  - [ ] Chat entre usuários
  - [ ] Calendário de agendamento de exames
  - [ ] Portal do funcionário (self-service)
  - [ ] Multi-idioma (i18n)
  - [ ] Temas customizáveis

### Analytics
- [ ] **Telemetria**
  - [ ] Google Analytics / Mixpanel
  - [ ] Rastreamento de erros (Sentry)
  - [ ] Performance monitoring
  - [ ] Usage analytics
  - [ ] A/B testing

---

## 📋 RESUMO POR PRIORIDADE

### Crítico (Bloqueia produção)
- ✅ Segurança: 18 items
- ✅ Backend: 63 items
- ✅ Migração: 8 items

**Total Crítico: 89 items**

### Alto (Necessário para produção)
- 🔶 Testes: 31 items
- 🔶 Tratamento de Erros: 11 items

**Total Alto: 42 items**

### Médio (Melhora experiência)
- 🔸 UX/UI: 23 items
- 🔸 Acessibilidade: 19 items
- 🔸 Funcionalidades: 28 items

**Total Médio: 70 items**

### Baixo (Pode aguardar)
- ⚪ Code Quality: 16 items
- ⚪ Documentação: 12 items
- ⚪ Features Extras: 14 items

**Total Baixo: 42 items**

---

## **TOTAL GERAL: 243 items**

---

## 🎯 ROADMAP SUGERIDO

### Fase 1 - Fundação (2-3 meses)
- Implementar backend completo
- Migrar para banco de dados
- Implementar autenticação segura
- Testes básicos (cobertura 50%)

### Fase 2 - Estabilização (1-2 meses)
- Aumentar cobertura de testes (70%)
- Melhorar tratamento de erros
- Implementar todas as validações
- UX improvements

### Fase 3 - Compliance (1-2 meses)
- Acessibilidade WCAG AA
- LGPD compliance
- Documentação completa
- Integração eSocial

### Fase 4 - Produção (1 mês)
- Deploy em staging
- Testes de carga
- Treinamento de usuários
- Go-live

### Fase 5 - Pós-Lançamento (ongoing)
- Features adicionais
- Integrações
- Otimizações
- Analytics

---

## 📌 NOTAS

- Este é um sistema com **vulnerabilidades críticas de segurança** - não usar em produção
- Estimativa de esforço: **6-9 meses** de desenvolvimento com equipe de 2-3 pessoas
- Requer conhecimento de: React, TypeScript, Node.js, PostgreSQL, AWS, regulamentações brasileiras
- Investimento necessário em infraestrutura cloud
- Necessário consultoria jurídica para compliance (LGPD, eSocial, NFe)

---

**Última atualização:** 2025-11-09
