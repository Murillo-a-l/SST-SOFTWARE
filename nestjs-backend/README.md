# Ocupalli Backend - Sistema de Saúde Ocupacional

Backend NestJS completo para sistema de clínica de saúde ocupacional, desenvolvido para **superar o Sistema ESO** do mercado.

## 🚀 Stack Tecnológica

- **Node.js** 18+
- **NestJS** 10
- **TypeScript** 5
- **Prisma ORM** 5
- **PostgreSQL** 15+
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Class Validator** para validações
- **Multer** para upload de arquivos
- **Swagger** para documentação

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# DATABASE_URL, JWT_SECRET, etc.

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de teste
npm run prisma:seed
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug
npm run start:debug
```

Servidor rodando em: `http://localhost:3000`
Documentação Swagger: `http://localhost:3000/api/docs`

## 📚 Estrutura do Projeto

```
src/
├── main.ts                     # Entry point
├── app.module.ts               # Módulo raiz
├── config/                     # Configurações
│   ├── config.module.ts
│   └── config.service.ts
├── common/                     # Código compartilhado
│   ├── exceptions/
│   │   └── business.exception.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── response.interceptor.ts
│   └── dto/
│       └── pagination-query.dto.ts
├── prisma/                     # Prisma module
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/                    # Módulos de negócio
    ├── auth/
    ├── user/
    ├── clinic-unit/
    ├── room/
    ├── company/
    ├── job/
    ├── worker/
    ├── employment/
    ├── procedure/
    ├── appointment/
    ├── document/
    └── file/
```

## 🔐 Autenticação

O sistema usa JWT com access token + refresh token.

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@ocupalli.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "name": "Admin",
    "email": "admin@ocupalli.com",
    "role": "ADMIN"
  }
}
```

### Usar Token
```http
GET /api/v1/appointments
Authorization: Bearer <accessToken>
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 Roles e Permissões

| Role | Permissões |
|------|------------|
| **ADMIN** | Todas as operações + gerenciar usuários |
| **DOCTOR** | Criar/editar documentos (ASO, Prontuário) |
| **RECEPTIONIST** | Criar/editar agendamentos, atualizar status |
| **TECHNICIAN** | Atualizar status de procedimentos específicos |

## 📋 Módulos e Endpoints Principais

### 1. Companies (Empresas)

```http
POST   /api/v1/companies
GET    /api/v1/companies
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
PATCH  /api/v1/companies/:id/delinquency
```

**Criar Empresa:**
```json
{
  "corporateName": "Acme Corporation Ltda",
  "tradeName": "Acme",
  "cnpj": "12345678000190",
  "active": true,
  "isDelinquent": false
}
```

### 2. Workers (Trabalhadores)

```http
POST   /api/v1/workers
GET    /api/v1/workers
GET    /api/v1/workers/:id
PATCH  /api/v1/workers/:id
```

**Criar Trabalhador:**
```json
{
  "name": "João Silva",
  "cpf": "12345678901",
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "phone": "11999999999",
  "email": "joao@example.com"
}
```

### 3. Jobs (Cargos)

```http
POST   /api/v1/jobs
GET    /api/v1/jobs
GET    /api/v1/jobs/:id
PATCH  /api/v1/jobs/:id
```

**Criar Cargo:**
```json
{
  "companyId": "clxxx",
  "name": "Operador de Máquinas",
  "cboCode": "841405",
  "gheCode": "GHE_02",
  "color": "#3B82F6",
  "sectorInfo": "Produção",
  "activitiesDescription": "Opera máquinas industriais..."
}
```

### 4. Employments (Vínculos)

```http
POST   /api/v1/employments
GET    /api/v1/employments
GET    /api/v1/employments/:id
PATCH  /api/v1/employments/:id
```

**Criar Vínculo:**
```json
{
  "workerId": "clxxx",
  "companyId": "clxxx",
  "jobId": "clxxx",
  "employmentType": "WITH_EMPLOYMENT",
  "employmentStartDate": "2025-01-01",
  "registration": "12345"
}
```

**Encerrar Vínculo:**
```json
{
  "employmentEndDate": "2025-12-31"
}
```

### 5. Procedures (Procedimentos/Exames)

```http
POST   /api/v1/procedures
GET    /api/v1/procedures
GET    /api/v1/procedures/:id
PATCH  /api/v1/procedures/:id
```

**Criar Procedimento:**
```json
{
  "code": "699116",
  "name": "Audiometria",
  "type": "IMAGE",
  "defaultDurationMinutes": 30
}
```

### 6. Appointments (Agendamentos)

```http
POST   /api/v1/appointments
GET    /api/v1/appointments
GET    /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id/status
PATCH  /api/v1/appointments/:id/procedures/:procedureId
```

**Criar Agendamento:**
```json
{
  "workerId": "clxxx",
  "companyId": "clxxx",
  "employmentId": "clxxx",
  "jobId": "clxxx",
  "roomId": "clxxx",
  "context": "ADMISSIONAL",
  "scheduledAt": "2025-12-01T10:00:00Z",
  "notes": "Exame admissional completo",
  "procedureIds": ["clxxx", "clyyy"]
}
```

**Atualizar Status:**
```json
{
  "status": "WAITING"
}
```

**Transições de Status Válidas:**
- `TO_COME` → `WAITING`
- `WAITING` → `IN_SERVICE`
- `IN_SERVICE` → `DONE`
- Qualquer → `RESCHEDULED` ou `CANCELED`

### 7. Sala de Espera

```http
GET /api/v1/waiting-room?date=2025-12-01&roomId=clxxx&status=WAITING
```

**Response:**
```json
{
  "toCome": [...],
  "waiting": [...],
  "inService": [...],
  "done": [...],
  "rescheduled": [...]
}
```

### 8. Documents (ASO, Prontuários, etc.)

```http
POST   /api/v1/documents
GET    /api/v1/documents
GET    /api/v1/documents/:id
PATCH  /api/v1/documents/:id
PATCH  /api/v1/documents/:id/finalize
PATCH  /api/v1/documents/:id/sign
GET    /api/v1/employments/:id/documents
```

**Criar Documento (ASO):**
```json
{
  "workerId": "clxxx",
  "companyId": "clxxx",
  "employmentId": "clxxx",
  "jobId": "clxxx",
  "type": "ASO",
  "context": "ADMISSIONAL",
  "date": "2025-12-01",
  "issuerDoctorId": "clxxx",
  "asoConclusion": "APTO",
  "observations": "..."
}
```

**Finalizar Documento:**
```http
PATCH /api/v1/documents/:id/finalize
```

**Assinar Documento:**
```http
PATCH /api/v1/documents/:id/sign
```

### 9. File Upload

```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

ownerType: DOCUMENT
ownerId: clxxx
file: [binary]
```

## ⚠️ Regras de Negócio Implementadas

### 1. Empresa Inadimplente

```typescript
// Ao criar ASO para empresa inadimplente
if (company.isDelinquent) {
  return {
    ...aso,
    warning: {
      code: 'COMPANY_DELINQUENT_WARNING',
      message: 'Empresa está inadimplente'
    }
  };
}
```

### 2. Trabalhador Demitido

**Regra 1:** Se vínculo já encerrado e existe ASO demissional FINAL:
```typescript
throw new BusinessException(
  BusinessErrorCode.EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED,
  'Não é possível criar documentos para vínculo encerrado'
);
```

**Regra 2:** ASO Demissional só pode ser criado se:
- `context = DISMISSAL`
- `employmentEndDate` existe
- Não existe outro ASO demissional FINAL para esse vínculo

### 3. Documentos em Rascunho

Não permitir finalizar (`DRAFT` → `FINAL`) se:
- Campos obrigatórios vazios
- Procedimentos do agendamento ainda `PENDING` ou `DOING`

```typescript
throw new BusinessException(
  BusinessErrorCode.DOCUMENT_INCOMPLETE_FOR_FINALIZATION,
  'Documento incompleto para finalização'
);
```

### 4. Agendamento com Procedimentos Abertos

Não permitir marcar como `DONE` se existirem procedimentos não concluídos:

```typescript
throw new BusinessException(
  BusinessErrorCode.APPOINTMENT_HAS_OPEN_PROCEDURES,
  'Agendamento possui procedimentos pendentes'
);
```

### 5. CPF e CNPJ Únicos

```typescript
// CPF único
const existing = await prisma.worker.findUnique({ where: { cpf } });
if (existing) {
  throw new BusinessException(
    BusinessErrorCode.CPF_ALREADY_EXISTS,
    'CPF já cadastrado'
  );
}

// CNPJ único
const existing = await prisma.company.findUnique({ where: { cnpj } });
if (existing) {
  throw new BusinessException(
    BusinessErrorCode.CNPJ_ALREADY_EXISTS,
    'CNPJ já cadastrado'
  );
}
```

## 🔍 Validações

Todas as DTOs usam `class-validator`:

```typescript
export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos' })
  cpf: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

## 🛡️ Filtro de Exceções

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "timestamp": "2025-11-29T10:30:00.000Z",
  "path": "/api/v1/appointments/123/status",
  "error": {
    "code": "APPOINTMENT_HAS_OPEN_PROCEDURES",
    "message": "Não é possível finalizar o agendamento com procedimentos pendentes.",
    "details": {
      "openProcedures": ["clxxx", "clyyy"]
    }
  }
}
```

## 📊 Exemplo de Fluxo Completo

### 1. Criar Empresa
```bash
POST /api/v1/companies
{
  "corporateName": "Acme Corp",
  "cnpj": "12345678000190"
}
# Response: { id: "cl_company_1" }
```

### 2. Criar Cargo
```bash
POST /api/v1/jobs
{
  "companyId": "cl_company_1",
  "name": "Operador",
  "cboCode": "841405"
}
# Response: { id: "cl_job_1" }
```

### 3. Criar Trabalhador
```bash
POST /api/v1/workers
{
  "name": "João Silva",
  "cpf": "12345678901"
}
# Response: { id: "cl_worker_1" }
```

### 4. Criar Vínculo
```bash
POST /api/v1/employments
{
  "workerId": "cl_worker_1",
  "companyId": "cl_company_1",
  "jobId": "cl_job_1",
  "employmentType": "WITH_EMPLOYMENT",
  "employmentStartDate": "2025-01-01"
}
# Response: { id: "cl_employment_1" }
```

### 5. Criar Procedimentos
```bash
POST /api/v1/procedures
{ "code": "001", "name": "Audiometria", "type": "IMAGE" }
# Response: { id: "cl_proc_1" }

POST /api/v1/procedures
{ "code": "002", "name": "Exame Clínico", "type": "CLINICAL" }
# Response: { id: "cl_proc_2" }
```

### 6. Criar Agendamento
```bash
POST /api/v1/appointments
{
  "workerId": "cl_worker_1",
  "companyId": "cl_company_1",
  "employmentId": "cl_employment_1",
  "context": "ADMISSIONAL",
  "scheduledAt": "2025-12-01T10:00:00Z",
  "procedureIds": ["cl_proc_1", "cl_proc_2"]
}
# Response: { id: "cl_appt_1", status: "TO_COME" }
```

### 7. Atualizar Status (Sala de Espera)
```bash
# Paciente chegou
PATCH /api/v1/appointments/cl_appt_1/status
{ "status": "WAITING" }

# Iniciar atendimento
PATCH /api/v1/appointments/cl_appt_1/status
{ "status": "IN_SERVICE" }

# Atualizar procedimento
PATCH /api/v1/appointments/cl_appt_1/procedures/cl_proc_1
{ "status": "DONE", "responsibleUserId": "cl_doctor_1" }
```

### 8. Criar ASO
```bash
POST /api/v1/documents
{
  "workerId": "cl_worker_1",
  "companyId": "cl_company_1",
  "employmentId": "cl_employment_1",
  "type": "ASO",
  "context": "ADMISSIONAL",
  "date": "2025-12-01",
  "issuerDoctorId": "cl_doctor_1",
  "asoConclusion": "APTO"
}
# Response: { id: "cl_doc_1", status: "DRAFT" }
```

### 9. Finalizar ASO
```bash
# Completar todos os procedimentos primeiro
PATCH /api/v1/appointments/cl_appt_1/procedures/cl_proc_2
{ "status": "DONE" }

# Finalizar documento
PATCH /api/v1/documents/cl_doc_1/finalize
# Response: { id: "cl_doc_1", status: "FINAL" }
```

### 10. Assinar ASO
```bash
PATCH /api/v1/documents/cl_doc_1/sign
# Response: { id: "cl_doc_1", signedAt: "2025-12-01T14:30:00Z" }
```

### 11. Finalizar Agendamento
```bash
PATCH /api/v1/appointments/cl_appt_1/status
{ "status": "DONE" }
# Response: { id: "cl_appt_1", status: "DONE", finishedAt: "..." }
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📖 Documentação Swagger

Acesse `http://localhost:3000/api/docs` para ver a documentação interativa completa.

## 🔧 Scripts Úteis

```bash
# Visualizar banco de dados
npm run prisma:studio

# Resetar banco (cuidado!)
npm run prisma:reset

# Gerar migration
npm run prisma:migrate

# Formatar código
npm run format

# Lint
npm run lint
```

## 🚀 Deploy

### Docker (Recomendado)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ocupalli
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ocupalli
      JWT_SECRET: your-secret
    depends_on:
      - db

volumes:
  postgres_data:
```

## 📝 Licença

Proprietary - Ocupalli Team

## 🤝 Contribuindo

Este projeto é privado. Para contribuir, entre em contato com a equipe.

## 📞 Suporte

- Email: suporte@ocupalli.com
- Documentação: https://docs.ocupalli.com
- Issues: GitHub Issues (privado)

---

**Desenvolvido com ❤️ para revolucionar a saúde ocupacional no Brasil**
**Objetivo:** Superar o Sistema ESO em tecnologia, UX e funcionalidades
