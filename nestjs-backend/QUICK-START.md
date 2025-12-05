# 🚀 Quick Start - Backend Ocupalli

Guia rápido para rodar o backend localmente e testar todos os fluxos principais.

---

## 📋 Pré-requisitos

- **Node.js** 18+ instalado
- **PostgreSQL** 13+ instalado e rodando
- **npm** ou **yarn**

---

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

```bash
cd nestjs-backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `nestjs-backend/`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/ocupalli_db?schema=public"

# JWT Secrets (MUDE ESTES VALORES EM PRODUÇÃO!)
JWT_SECRET="ocupalli-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="ocupalli-super-secret-refresh-key-change-in-production-2024"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS (frontend URL)
CORS_ORIGIN="http://localhost:3002"
```

**Substitua:**
- `postgres` → seu usuário do PostgreSQL
- `sua_senha` → sua senha do PostgreSQL
- `ocupalli_db` → nome do banco (será criado automaticamente)

---

### 3. Criar Banco e Executar Migrations

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations (cria todas as tabelas)
npm run prisma:migrate

# Executar seed (popular banco com dados de teste)
npm run prisma:seed
```

**Resultado esperado do seed:**
- ✅ 4 usuários criados
- ✅ 2 unidades clínicas e 3 salas
- ✅ 5 procedimentos médicos
- ✅ 3 empresas (1 inadimplente)
- ✅ 4 cargos
- ✅ 4 trabalhadores
- ✅ 4 vínculos empregatícios
- ✅ 3 agendamentos (1 WAITING, 1 IN_SERVICE, 1 TO_COME)
- ✅ 3 documentos (1 FINALIZED, 1 DRAFT)

---

### 4. Iniciar o Servidor

```bash
npm run dev
```

**Servidor rodando em:** `http://localhost:3000`
**Swagger (documentação):** `http://localhost:3000/api/docs`

---

## 👥 Usuários de Teste

Use estes logins para testar diferentes roles:

### 🔴 ADMIN (acesso total)
```
Email: admin@ocupalli.com.br
Senha: admin123
```

### 🟢 MÉDICO
```
Email: joao.silva@ocupalli.com.br
Senha: doctor123
```

### 🟡 RECEPCIONISTA
```
Email: maria.recepcao@ocupalli.com.br
Senha: recepcao123
```

### 🔵 TÉCNICO
```
Email: carlos.tecnico@ocupalli.com.br
Senha: tecnico123
```

---

## 🧪 Fluxos de Teste Principais

### 1️⃣ Autenticação + Roles

**Via Swagger (`http://localhost:3000/api/docs`):**

1. **Login:**
   - Endpoint: `POST /api/v1/auth/login`
   - Body:
     ```json
     {
       "email": "admin@ocupalli.com.br",
       "password": "admin123"
     }
     ```
   - Copie o `accessToken` retornado

2. **Authorize:**
   - Clique no botão **"Authorize"** (cadeado verde)
   - Cole o `accessToken` no campo
   - Clique em "Authorize"

3. **Testar Permissões:**
   - Tente acessar `GET /api/v1/users` (apenas ADMIN)
   - Logout e faça login com DOCTOR
   - Tente novamente (deve dar 403 Forbidden)

---

### 2️⃣ Empresa Inadimplente

**Empresa de teste:** `ConstrutechBR` (CNPJ: `98765432000111`)

1. **Listar empresas inadimplentes:**
   - `GET /api/v1/companies/delinquent`
   - Deve retornar `ConstrutechBR`

2. **Verificar inadimplência:**
   - `GET /api/v1/companies/{id}/check-delinquency`
   - Use o ID da `ConstrutechBR`
   - Deve retornar erro com warning de inadimplência

3. **Alternar status:**
   - `PATCH /api/v1/companies/{id}/toggle-delinquency`
   - Marca/desmarca como inadimplente

---

### 3️⃣ Sala de Espera

1. **Ver pacientes aguardando:**
   - `GET /api/v1/appointments/waiting-room`
   - Deve retornar **Pedro Henrique Santos** em status `WAITING`

2. **Atualizar status (transição):**
   - `PATCH /api/v1/appointments/{id}/status/IN_SERVICE`
   - Use o ID do agendamento de Pedro
   - Verifica transição de status válida

3. **Testar transição inválida:**
   - `PATCH /api/v1/appointments/{id}/status/DONE`
   - Use um agendamento em `TO_COME`
   - Deve dar erro (transição inválida)

**Transições válidas:**
- `TO_COME` → `WAITING` ou `CANCELLED`
- `WAITING` → `IN_SERVICE` ou `CANCELLED`
- `IN_SERVICE` → `DONE` ou `CANCELLED`

---

### 4️⃣ ASO Demissional e Encerramento de Vínculo

**Trabalhador de teste:** `Carlos Eduardo Silva` (CPF: `11122233344`)

#### Passo 1: Buscar vínculo ativo

```bash
GET /api/v1/employments?workerId={carlosId}
```

Confirme que `employmentEndDate` é `null` (vínculo ativo).

#### Passo 2: Criar ASO demissional

```bash
POST /api/v1/documents
```

Body:
```json
{
  "type": "ASO",
  "workerId": "{carlosId}",
  "employmentId": "{employmentId}",
  "issueDate": "2024-12-20",
  "asoConclusion": "APTO",
  "dismissEmployee": true,
  "notes": "ASO Demissional - Pedido de demissão"
}
```

#### Passo 3: Finalizar documento

```bash
POST /api/v1/documents/{documentId}/finalize
```

Body:
```json
{
  "notes": "Documento revisado e aprovado"
}
```

**Resultado esperado:**
- ✅ Documento status muda para `FINALIZED`
- ✅ Vínculo empregatício é **automaticamente encerrado** (`employmentEndDate` preenchido)

#### Passo 4: Verificar vínculo encerrado

```bash
GET /api/v1/employments/{employmentId}
```

Confirme que `employmentEndDate` agora tem a data de emissão do ASO.

#### Passo 5: Tentar criar novo documento (deve falhar)

```bash
POST /api/v1/documents
```

Use o mesmo `employmentId`. Deve retornar erro:
```
"Não é possível criar documentos para vínculo empregatício já terminado"
```

---

### 5️⃣ Upload/Download de Arquivos

#### Upload:

```bash
POST /api/v1/files/upload
```

**Form-data:**
- `documentId`: ID de um documento existente
- `file`: Selecione um arquivo PDF/JPG/PNG

**Tipos permitidos:**
- PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
- Limite: 50MB

#### Download:

```bash
GET /api/v1/files/{fileId}/download
```

O arquivo será baixado automaticamente.

#### Listar arquivos:

```bash
GET /api/v1/files?documentId={documentId}
```

#### Estatísticas:

```bash
GET /api/v1/files/stats
```

Retorna total de arquivos, tamanho total, agrupamento por tipo.

---

### 6️⃣ Outras Regras de Negócio

#### ASO Demissional Duplicado

Tente criar 2 ASOs demissionais para o mesmo vínculo:

```bash
POST /api/v1/documents
```

O segundo deve retornar erro:
```
"Já existe um ASO demissional para este vínculo empregatício"
```

#### ASO sem Conclusão

Crie um ASO sem `asoConclusion` e tente finalizar:

```bash
POST /api/v1/documents/{id}/finalize
```

Deve retornar erro:
```
"ASO deve ter uma conclusão antes de ser finalizado"
```

#### Documento Finalizado (imutável)

Tente editar um documento com status `FINALIZED`:

```bash
PATCH /api/v1/documents/{id}
```

Deve retornar erro:
```
"Não é possível editar documento já finalizado"
```

---

## 🛠️ Comandos Úteis

### Prisma Studio (GUI do banco)
```bash
npm run prisma:studio
```

Abre interface visual em `http://localhost:5555`

### Resetar Banco (CUIDADO!)
```bash
npm run prisma:reset
```

Apaga tudo, re-executa migrations e seed.

### Ver Logs do Servidor
```bash
npm run dev
```

Logs aparecem no terminal.

---

## 📊 Checklist de Testes

- [ ] Login com cada role (ADMIN, DOCTOR, RECEPTIONIST, TECHNICIAN)
- [ ] Verificar permissões por role (endpoints bloqueados)
- [ ] Listar empresas inadimplentes
- [ ] Verificar warning de inadimplência
- [ ] Ver sala de espera (GET /waiting-room)
- [ ] Criar agendamento e mudar status
- [ ] Testar transição de status inválida
- [ ] Criar ASO demissional
- [ ] Finalizar ASO demissional
- [ ] Verificar vínculo encerrado automaticamente
- [ ] Tentar criar documento para vínculo encerrado (deve falhar)
- [ ] Tentar ASO demissional duplicado (deve falhar)
- [ ] Upload de arquivo PDF
- [ ] Download de arquivo
- [ ] Finalizar ASO sem conclusão (deve falhar)
- [ ] Editar documento finalizado (deve falhar)

---

## 🎯 Endpoints Principais

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Usuário logado

### Companies
- `GET /api/v1/companies` - Listar empresas
- `GET /api/v1/companies/delinquent` - Empresas inadimplentes
- `GET /api/v1/companies/{id}/check-delinquency` - Verificar inadimplência

### Appointments
- `GET /api/v1/appointments/waiting-room` - Sala de espera
- `PATCH /api/v1/appointments/{id}/status/{newStatus}` - Mudar status

### Documents
- `POST /api/v1/documents` - Criar documento
- `POST /api/v1/documents/{id}/finalize` - Finalizar documento
- `GET /api/v1/documents/dismissal` - ASOs demissionais

### Files
- `POST /api/v1/files/upload` - Upload
- `GET /api/v1/files/{id}/download` - Download
- `GET /api/v1/files/stats` - Estatísticas

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### Erro: "Database 'ocupalli_db' does not exist"
O Prisma cria automaticamente. Se não criar:
```sql
CREATE DATABASE ocupalli_db;
```

### Erro: "Role 'postgres' does not exist"
Crie o role no PostgreSQL ou use outro usuário no `DATABASE_URL`.

### Porta 3000 já em uso
Mude no `.env`:
```env
PORT=3001
```

### Seed falha
Resete o banco:
```bash
npm run prisma:reset
```

---

## 📖 Documentação Completa

- **Swagger:** `http://localhost:3000/api/docs`
- **Prisma Studio:** `http://localhost:5555` (após `npm run prisma:studio`)

---

## ✅ Sucesso!

Se todos os fluxos acima funcionarem, o backend está 100% operacional! 🎉

Qualquer dúvida, consulte:
- `README.md` - Documentação completa
- `PROGRESSO.md` - Status da implementação
- `IMPLEMENTATION-GUIDE.md` - Guia técnico

**Swagger é seu melhor amigo para testes!** 🚀
