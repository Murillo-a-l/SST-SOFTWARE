# Implementação do Sistema de Saúde Ocupacional - Ocupalli

## Resumo da Implementação

Esta implementação adiciona a **estrutura oficial do sistema Ocupalli**, um sistema de gestão de saúde ocupacional desenvolvido para **superar o Sistema ESO** (sistemaeso.com.br). A estrutura foi projetada para ser a base de um sistema moderno, escalável, compatível com eSocial e superior ao concorrente existente no mercado.

---

## Estrutura Implementada

### 1. Modelos do Banco de Dados (Prisma Schema)

Todos os modelos foram adicionados ao arquivo `backend/prisma/schema.prisma`:

#### 1.1 Company (Empresa)
- **Tabela:** `companies`
- **ID:** UUID (String)
- **Campos principais:**
  - razaoSocial, nomeFantasia, cnpj (unique)
  - cnae, grauRisco (1-4)
  - Endereço completo (cep, logradouro, numero, bairro, cidade, estado)
  - email, telefone, observacoes
- **Relações:**
  - Matriz/Filial (self-relation)
  - Ambientes (CompanyAmbiente)
  - Cargos (CompanyCargo)
  - Vínculos (PessoaCargo)

#### 1.2 Person (Pessoa)
- **Tabela:** `persons`
- **ID:** UUID (String)
- **Campos principais:**
  - nome, cpf (unique)
  - dataNascimento, sexo
  - Endereço completo
  - telefone, email, observacoes
- **Relações:**
  - Vínculos (PessoaCargo)

#### 1.3 CompanyCargo (Cargo)
- **Tabela:** `company_cargos`
- **ID:** UUID (String)
- **Vinculado à empresa**
- **Campos:** nome, cbo, descricao
- **Relações:**
  - Riscos (CargoRisco - pivô)
  - Exames (CargoExame - pivô)
  - Ambientes (CargoAmbiente - pivô)
  - Vínculos (PessoaCargo)

#### 1.4 CompanyAmbiente (Ambiente)
- **Tabela:** `company_ambientes`
- **ID:** UUID (String)
- **Vinculado à empresa**
- **Campos:** nome, descricao

#### 1.5 GlobalRisco (Risco)
- **Tabela:** `global_riscos`
- **ID:** UUID (String)
- **Catálogo global**
- **Campos:** nome, codigo (Tabela 24 eSocial), grupo (físico, químico, biológico, ergonômico, acidente), descricao

#### 1.6 GlobalExame (Exame/Procedimento)
- **Tabela:** `global_exames`
- **ID:** UUID (String)
- **Catálogo global**
- **Campos:** nome, codigo, tipo (admissional, periódico, retorno, mudança de risco, demissional), descricao

#### 1.7 Tabelas Pivô
- **CargoRisco:** Liga cargos a riscos (company_cargos ↔ global_riscos)
- **CargoExame:** Liga cargos a exames (company_cargos ↔ global_exames)
- **CargoAmbiente:** Liga cargos a ambientes (company_cargos ↔ company_ambientes)

#### 1.8 PessoaCargo (Vínculo)
- **Tabela:** `pessoa_cargos`
- **ID:** UUID (String)
- **Liga Person → Company → Cargo**
- **Campos:** ativo, dataEntrada, dataSaida

---

## 2. Regras de Negócio Implementadas

### 2.1 Company (Empresa)
✅ CNPJ único
✅ Validação de empresa matriz (deve existir e ser matriz=true)
✅ Exclusão bloqueada se houver cargos, ambientes ou vínculos
✅ Rotas especiais:
  - `GET /company/:id/filiais`
  - `GET /company/:id/cargos`
  - `GET /company/:id/ambientes`
  - `GET /company/:id/pessoas`

### 2.2 Person (Pessoa)
✅ CPF único
✅ Exclusão bloqueada se houver vínculos ativos
✅ Rotas especiais:
  - `GET /person/:id/vinculos`

### 2.3 Cargo
✅ Vinculado a uma empresa (empresaId obrigatório)
✅ Exclusão bloqueada se houver vínculos
✅ Ao deletar, remove automaticamente relações pivô (cascade)
✅ Rotas especiais:
  - `POST /cargo/:id/riscos` - Adiciona risco
  - `DELETE /cargo/:id/riscos/:riscoId` - Remove risco
  - `POST /cargo/:id/exames` - Adiciona exame
  - `DELETE /cargo/:id/exames/:exameId` - Remove exame
  - `POST /cargo/:id/ambientes` - Adiciona ambiente
  - `DELETE /cargo/:id/ambientes/:ambienteId` - Remove ambiente

### 2.4 Ambiente
✅ Vinculado a uma empresa (empresaId obrigatório)
✅ Exclusão bloqueada se houver cargos vinculados

### 2.5 Risco e Exame (Catálogos Globais)
✅ Exclusão bloqueada se houver cargos vinculados

### 2.6 Vínculo (PessoaCargo)
✅ Uma pessoa pode ter apenas **um vínculo ativo por empresa**
✅ Validação de person, empresa e cargo ao criar
✅ Cargo deve pertencer à empresa do vínculo
✅ Rotas especiais:
  - `PUT /vinculo/:id/inativar` - Inativa vínculo (ativo=false, dataSaida)
  - `PUT /vinculo/:id/reativar` - Reativa vínculo (valida se não há outro ativo)

---

## 3. API REST - Endpoints Implementados

Todas as rotas requerem autenticação JWT (`authenticate` middleware).
Rotas de criação/edição/exclusão requerem role ADMIN (`authorize('ADMIN')` middleware).

### 3.1 Company
```
GET    /api/company               - Lista todas empresas
GET    /api/company/:id           - Busca empresa por ID
POST   /api/company               - Cria empresa (ADMIN)
PUT    /api/company/:id           - Atualiza empresa (ADMIN)
DELETE /api/company/:id           - Deleta empresa (ADMIN)
GET    /api/company/:id/filiais   - Lista filiais
GET    /api/company/:id/cargos    - Lista cargos da empresa
GET    /api/company/:id/ambientes - Lista ambientes da empresa
GET    /api/company/:id/pessoas   - Lista pessoas vinculadas
```

### 3.2 Person
```
GET    /api/person         - Lista todas pessoas
GET    /api/person/:id     - Busca pessoa por ID
POST   /api/person         - Cria pessoa (ADMIN)
PUT    /api/person/:id     - Atualiza pessoa (ADMIN)
DELETE /api/person/:id     - Deleta pessoa (ADMIN)
GET    /api/person/:id/vinculos - Lista vínculos
```

### 3.3 Cargo
```
GET    /api/cargo              - Lista todos cargos (query: ?empresaId=uuid)
GET    /api/cargo/:id          - Busca cargo por ID
POST   /api/cargo              - Cria cargo (ADMIN)
PUT    /api/cargo/:id          - Atualiza cargo (ADMIN)
DELETE /api/cargo/:id          - Deleta cargo (ADMIN)
POST   /api/cargo/:id/riscos   - Adiciona risco ao cargo (ADMIN)
DELETE /api/cargo/:id/riscos/:riscoId - Remove risco (ADMIN)
POST   /api/cargo/:id/exames   - Adiciona exame ao cargo (ADMIN)
DELETE /api/cargo/:id/exames/:exameId - Remove exame (ADMIN)
POST   /api/cargo/:id/ambientes - Adiciona ambiente ao cargo (ADMIN)
DELETE /api/cargo/:id/ambientes/:ambienteId - Remove ambiente (ADMIN)
```

### 3.4 Ambiente
```
GET    /api/ambiente       - Lista todos ambientes (query: ?empresaId=uuid)
GET    /api/ambiente/:id   - Busca ambiente por ID
POST   /api/ambiente       - Cria ambiente (ADMIN)
PUT    /api/ambiente/:id   - Atualiza ambiente (ADMIN)
DELETE /api/ambiente/:id   - Deleta ambiente (ADMIN)
```

### 3.5 Risco
```
GET    /api/risco         - Lista todos riscos (catálogo global)
GET    /api/risco/:id     - Busca risco por ID
POST   /api/risco         - Cria risco (ADMIN)
PUT    /api/risco/:id     - Atualiza risco (ADMIN)
DELETE /api/risco/:id     - Deleta risco (ADMIN)
```

### 3.6 Exame (GlobalExame)
```
GET    /api/global-exame         - Lista todos exames (catálogo global)
GET    /api/global-exame/:id     - Busca exame por ID
POST   /api/global-exame         - Cria exame (ADMIN)
PUT    /api/global-exame/:id     - Atualiza exame (ADMIN)
DELETE /api/global-exame/:id     - Deleta exame (ADMIN)
```

### 3.7 Vínculo (PessoaCargo)
```
GET    /api/vinculo              - Lista vínculos (query: ?empresaId=uuid&personId=uuid&ativo=true)
GET    /api/vinculo/:id          - Busca vínculo por ID
POST   /api/vinculo              - Cria vínculo (ADMIN)
PUT    /api/vinculo/:id          - Atualiza vínculo (ADMIN)
DELETE /api/vinculo/:id          - Deleta vínculo (ADMIN)
PUT    /api/vinculo/:id/inativar - Inativa vínculo (ADMIN)
PUT    /api/vinculo/:id/reativar - Reativa vínculo (ADMIN)
```

---

## 4. Estrutura de Arquivos Criados

### Validators (Zod)
- `backend/src/validators/eso.validators.ts` - Todas as validações Zod

### Services (Regras de Negócio)
- `backend/src/services/company.service.ts`
- `backend/src/services/person.service.ts`
- `backend/src/services/cargo.service.ts`
- `backend/src/services/vinculo.service.ts`

### Controllers
- `backend/src/controllers/company.controller.ts`
- `backend/src/controllers/person.controller.ts`
- `backend/src/controllers/cargo.controller.ts`
- `backend/src/controllers/ambiente.controller.ts`
- `backend/src/controllers/risco.controller.ts`
- `backend/src/controllers/exame.controller.ts`
- `backend/src/controllers/vinculo.controller.ts`

### Routes
- `backend/src/routes/company.routes.ts`
- `backend/src/routes/person.routes.ts`
- `backend/src/routes/cargo.routes.ts`
- `backend/src/routes/ambiente.routes.ts`
- `backend/src/routes/risco.routes.ts`
- `backend/src/routes/globalExame.routes.ts`
- `backend/src/routes/vinculo.routes.ts`

---

## 5. Padrões de Código Seguidos

✅ Controllers separados por módulo
✅ Services com regras de negócio isoladas
✅ Validação com Zod em todos endpoints
✅ Retorno JSON padronizado:
```json
{
  "status": "success",
  "data": { ... }
}
```

✅ Tratamento de erros com `AppError`:
```json
{
  "status": "error",
  "message": "Mensagem clara do erro"
}
```

✅ Campos opcionais aceitam `null`
✅ Campos extras não declarados são rejeitados
✅ `updatedAt` atualizado automaticamente pelo Prisma

---

## 6. Como Usar

### 6.1 Resetar Banco e Aplicar Schema
```bash
cd backend
npx prisma db push --accept-data-loss
npm run prisma:seed
```

### 6.2 Iniciar Servidor
```bash
cd backend
npm run dev  # Porta 3001
```

### 6.3 Testar API

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

**Criar Empresa:**
```bash
curl -X POST http://localhost:3001/api/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "razaoSocial": "Acme Corp Ltda",
    "nomeFantasia": "Acme",
    "cnpj": "12345678000190",
    "matriz": true
  }'
```

**Criar Pessoa:**
```bash
curl -X POST http://localhost:3001/api/person \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901"
  }'
```

**Criar Cargo:**
```bash
curl -X POST http://localhost:3001/api/cargo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "nome": "Operador de Máquinas",
    "cbo": "841405",
    "empresaId": "<COMPANY_UUID>"
  }'
```

**Criar Vínculo:**
```bash
curl -X POST http://localhost:3001/api/vinculo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "personId": "<PERSON_UUID>",
    "empresaId": "<COMPANY_UUID>",
    "cargoId": "<CARGO_UUID>",
    "ativo": true,
    "dataEntrada": "2025-01-01"
  }'
```

---

## 7. Próximos Passos Recomendados

### 7.1 Módulos Futuros (Baseados nesta estrutura)
- [ ] Agendamentos
- [ ] Sala de espera
- [ ] Documentos (ASO, PCMSO)
- [ ] Prontuário médico
- [ ] Assinatura digital
- [ ] Audiograma
- [ ] Integração eSocial

### 7.2 Melhorias
- [ ] Testes automatizados (Jest)
- [ ] Documentação OpenAPI/Swagger
- [ ] Paginação nas listagens
- [ ] Filtros avançados
- [ ] Logs de auditoria
- [ ] Cache (Redis)

---

## 8. Checklist de Implementação

### ✅ Concluído
- [x] Modelos Prisma exatamente como especificado
- [x] Validação Zod em todos endpoints
- [x] Services com regras de negócio
- [x] Controllers padronizados
- [x] Rotas CRUD completas
- [x] Rotas especiais (filiais, vínculos, etc)
- [x] Regra: CPF único
- [x] Regra: CNPJ único
- [x] Regra: Matriz/Filial
- [x] Regra: Um vínculo ativo por empresa
- [x] Regra: Validação de dependências antes de deletar
- [x] Regra: Cascade delete em pivôs
- [x] Schema sincronizado com banco
- [x] Seed executado
- [x] Build sem erros

---

## 9. Observações Importantes

1. **Convivência com Sistema Antigo:**
   - Os modelos antigos (`Empresa`, `Funcionario`, etc.) ainda existem
   - Os novos modelos têm prefixos claros (`Company`, `Person`, `CompanyCargo`)
   - As rotas antigas continuam funcionando (`/empresas`, `/funcionarios`)
   - As novas rotas estão em `/company`, `/person`, etc.

2. **UUID vs Int:**
   - Sistema antigo usa `Int` (autoincrement)
   - Novo sistema usa `String` (UUID) - melhor para distribuição e eSocial

3. **Separação Person vs Funcionario:**
   - `Person`: cadastro único de pessoas (CPF único global)
   - `PessoaCargo`: vínculo de pessoa com empresa/cargo (pode ter múltiplos)
   - `Funcionario` (antigo): pessoa já vinculada a uma empresa

---

## 10. Credenciais de Teste

**Admin:**
- Username: `admin`
- Password: `admin`

**Usuário:**
- Username: `joao.medico`
- Password: `123`

---

**Status:** ✅ **Implementação Completa e Funcional**

**Data:** 29/11/2025

**Desenvolvido por:** Claude Code
