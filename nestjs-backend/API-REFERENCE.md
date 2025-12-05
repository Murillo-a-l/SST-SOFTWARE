# 📚 API REFERENCE - BACKEND NESTJS OCUPALLI

**Versão:** 1.0.0
**Última Atualização:** 03/12/2025
**Base URL:** `http://localhost:3000/api/v1`
**Swagger:** `http://localhost:3000/api/docs`

---

## 📋 ÍNDICE

1. [Autenticação](#1-autenticação)
2. [Usuários](#2-usuários)
3. [Empresas](#3-empresas)
4. [Trabalhadores](#4-trabalhadores)
5. [Cargos](#5-cargos)
6. [Vínculos Empregatícios](#6-vínculos-empregatícios)
7. [Procedimentos](#7-procedimentos)
8. [Agendamentos](#8-agendamentos)
9. [Documentos](#9-documentos)
10. [Arquivos](#10-arquivos)
11. [Unidades Clínicas](#11-unidades-clínicas)
12. [Salas](#12-salas)
13. [Mapeamento de Riscos](#13-mapeamento-de-riscos)
14. [Exames Ocupacionais](#14-exames-ocupacionais)
15. [Regras de Exames](#15-regras-de-exames)
16. [PCMSO](#16-pcmso)
17. [Tipos e Enums](#17-tipos-e-enums)

---

## 1. AUTENTICAÇÃO

### 1.1 Login

**POST** `/auth/login`

Autentica um usuário e retorna tokens JWT.

**Request Body:**
```json
{
  "email": "admin@ocupalli.com.br",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm3abc123",
    "name": "Administrador",
    "email": "admin@ocupalli.com.br",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Credenciais Padrão (Seed):**
- Admin: `admin@ocupalli.com.br` / `admin123`
- Doctor: `joao.silva@ocupalli.com.br` / `doctor123`
- Receptionist: `maria.recepcao@ocupalli.com.br` / `recepcao123`
- Technician: `carlos.tecnico@ocupalli.com.br` / `tecnico123`

---

### 1.2 Register

**POST** `/auth/register`

Registra um novo usuário (requer autenticação ADMIN).

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "DOCTOR"
}
```

**Response 201:**
```json
{
  "id": "cm3xyz789",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "DOCTOR",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 1.3 Refresh Token

**POST** `/auth/refresh`

Renova o access token usando o refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

---

### 1.4 Get Current User

**GET** `/auth/me`

Retorna informações do usuário autenticado.

**Headers:** `Authorization: Bearer {accessToken}`

**Response 200:**
```json
{
  "id": "cm3abc123",
  "name": "Administrador",
  "email": "admin@ocupalli.com.br",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 1.5 Logout

**POST** `/auth/logout`

Invalida o refresh token do usuário.

**Headers:** `Authorization: Bearer {accessToken}`

**Response 200:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 2. USUÁRIOS

### 2.1 Criar Usuário

**POST** `/users`

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "role": "RECEPTIONIST",
  "active": true
}
```

**Response 201:** User object

---

### 2.2 Listar Usuários

**GET** `/users`

**Query Params:**
- `role` (opcional): Filtrar por role (ADMIN, DOCTOR, RECEPTIONIST, TECHNICIAN)
- `active` (opcional): true/false

**Response 200:**
```json
[
  {
    "id": "cm3abc123",
    "name": "Administrador",
    "email": "admin@ocupalli.com.br",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 2.3 Buscar Usuário por ID

**GET** `/users/:id`

**Response 200:** User object

---

### 2.4 Atualizar Usuário

**PATCH** `/users/:id`

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "active": false
}
```

**Response 200:** Updated user object

---

### 2.5 Excluir Usuário

**DELETE** `/users/:id`

**Response 200:**
```json
{
  "message": "Usuário removido com sucesso"
}
```

---

### 2.6 Trocar Senha

**PATCH** `/users/:id/change-password`

**Request Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

**Response 200:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 3. EMPRESAS

### 3.1 Criar Empresa

**POST** `/companies`

**Request Body:**
```json
{
  "corporateName": "Empresa Exemplo LTDA",
  "tradeName": "Empresa Exemplo",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@exemplo.com.br",
  "phone": "(11) 98765-4321",
  "address": "Rua Exemplo, 123 - São Paulo/SP",
  "active": true,
  "isDelinquent": false
}
```

**Response 201:**
```json
{
  "id": "cm3company1",
  "corporateName": "Empresa Exemplo LTDA",
  "tradeName": "Empresa Exemplo",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@exemplo.com.br",
  "phone": "(11) 98765-4321",
  "address": "Rua Exemplo, 123 - São Paulo/SP",
  "active": true,
  "isDelinquent": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 3.2 Listar Empresas

**GET** `/companies`

**Query Params:**
- `active` (opcional): true/false
- `isDelinquent` (opcional): true/false

**Response 200:**
```json
[
  {
    "id": "cm3company1",
    "corporateName": "Empresa Exemplo LTDA",
    "tradeName": "Empresa Exemplo",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@exemplo.com.br",
    "phone": "(11) 98765-4321",
    "address": "Rua Exemplo, 123 - São Paulo/SP",
    "active": true,
    "isDelinquent": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "workers": 15,
      "jobs": 8,
      "appointments": 42,
      "documents": 30
    }
  }
]
```

---

### 3.3 Listar Empresas Inadimplentes

**GET** `/companies/delinquent`

**Response 200:** Array de empresas com `isDelinquent: true`

---

### 3.4 Buscar Empresa por ID

**GET** `/companies/:id`

**Response 200:** Company object com contagens

---

### 3.5 Atualizar Empresa

**PATCH** `/companies/:id`

**Request Body:**
```json
{
  "tradeName": "Novo Nome Fantasia",
  "phone": "(11) 91234-5678"
}
```

**Response 200:** Updated company object

---

### 3.6 Excluir Empresa (Soft Delete)

**DELETE** `/companies/:id`

**Response 200:**
```json
{
  "message": "Empresa removida com sucesso"
}
```

---

### 3.7 Alternar Inadimplência

**PATCH** `/companies/:id/toggle-delinquency`

Alterna o status de inadimplência (true ↔ false).

**Response 200:** Company object com status atualizado

---

### 3.8 Verificar Inadimplência

**GET** `/companies/:id/check-delinquency`

**Response 200:**
```json
{
  "isDelinquent": false
}
```

---

## 4. TRABALHADORES

### 4.1 Criar Trabalhador

**POST** `/workers`

**Request Body:**
```json
{
  "companyId": "cm3company1",
  "name": "João da Silva",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "phone": "(11) 98765-4321",
  "email": "joao@example.com",
  "address": "Rua A, 100 - São Paulo/SP",
  "active": true
}
```

**Response 201:**
```json
{
  "id": "cm3worker1",
  "companyId": "cm3company1",
  "name": "João da Silva",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "gender": "MALE",
  "phone": "(11) 98765-4321",
  "email": "joao@example.com",
  "address": "Rua A, 100 - São Paulo/SP",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4.2 Listar Trabalhadores

**GET** `/workers`

**Query Params:**
- `companyId` (opcional): Filtrar por empresa
- `active` (opcional): true/false

**Response 200:**
```json
[
  {
    "id": "cm3worker1",
    "companyId": "cm3company1",
    "name": "João da Silva",
    "cpf": "123.456.789-00",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "gender": "MALE",
    "phone": "(11) 98765-4321",
    "email": "joao@example.com",
    "address": "Rua A, 100 - São Paulo/SP",
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "employments": 1,
      "appointments": 5,
      "documents": 3
    }
  }
]
```

---

### 4.3 Buscar por CPF

**GET** `/workers/cpf/:cpf`

**Exemplo:** `/workers/cpf/12345678900`

**Response 200:** Worker object

---

### 4.4 Buscar Trabalhador por ID

**GET** `/workers/:id`

**Response 200:** Worker object com contagens

---

### 4.5 Atualizar Trabalhador

**PATCH** `/workers/:id`

**Request Body:**
```json
{
  "phone": "(11) 91234-5678",
  "email": "novoemail@example.com"
}
```

**Response 200:** Updated worker object

---

### 4.6 Excluir Trabalhador (Soft Delete)

**DELETE** `/workers/:id`

**Response 200:**
```json
{
  "message": "Trabalhador removido com sucesso"
}
```

---

### 4.7 Reativar Trabalhador

**PATCH** `/workers/:id/reactivate`

Reativa um trabalhador desativado.

**Response 200:** Worker object com `active: true`

---

## 5. CARGOS

### 5.1 Criar Cargo

**POST** `/jobs`

**Request Body:**
```json
{
  "companyId": "cm3company1",
  "title": "Operador de Máquinas",
  "cbo": "8113-05",
  "name": "Operador de Máquinas Industriais",
  "description": "Opera máquinas industriais de produção",
  "active": true
}
```

**Response 201:**
```json
{
  "id": "cm3job1",
  "companyId": "cm3company1",
  "title": "Operador de Máquinas",
  "cbo": "8113-05",
  "name": "Operador de Máquinas Industriais",
  "description": "Opera máquinas industriais de produção",
  "gheCode": null,
  "cboCode": null,
  "color": null,
  "icon": null,
  "esocialStartDate": null,
  "sectorInfo": null,
  "activitiesDescription": null,
  "workJourney": null,
  "generalRecommendations": null,
  "gfipCode": null,
  "ergonomicMethodology": null,
  "generalObservations": null,
  "technicalOpinionLTCAT": null,
  "technicalOpinionPericulosidade": null,
  "technicalOpinionInsalubridade": null,
  "active": true,
  "mainEnvironmentId": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 5.2 Listar Cargos

**GET** `/jobs`

**Query Params:**
- `companyId` (opcional): Filtrar por empresa
- `active` (opcional): true/false

**Response 200:** Array de job objects com contagens

---

### 5.3 Buscar por CBO

**GET** `/jobs/cbo/:cbo`

**Exemplo:** `/jobs/cbo/8113-05`

**Response 200:** Array de jobs com aquele CBO

---

### 5.4 Buscar Cargo por ID

**GET** `/jobs/:id`

**Response 200:** Job object com contagens

---

### 5.5 Atualizar Cargo

**PATCH** `/jobs/:id`

**Request Body:**
```json
{
  "title": "Operador de Máquinas Pesadas",
  "description": "Nova descrição"
}
```

**Response 200:** Updated job object

---

### 5.6 Excluir Cargo (Soft Delete)

**DELETE** `/jobs/:id`

**Response 200:**
```json
{
  "message": "Cargo removido com sucesso"
}
```

---

## 6. VÍNCULOS EMPREGATÍCIOS

### 6.1 Criar Vínculo

**POST** `/employments`

**Request Body:**
```json
{
  "workerId": "cm3worker1",
  "companyId": "cm3company1",
  "jobId": "cm3job1",
  "employmentType": "WITH_EMPLOYMENT",
  "esocialCategory": "101",
  "registration": "12345",
  "entryExamDate": "2025-01-01",
  "employmentStartDate": "2025-01-02",
  "notes": "Observações do vínculo"
}
```

**Response 201:**
```json
{
  "id": "cm3employment1",
  "workerId": "cm3worker1",
  "companyId": "cm3company1",
  "jobId": "cm3job1",
  "employmentType": "WITH_EMPLOYMENT",
  "esocialCategory": "101",
  "registration": "12345",
  "entryExamDate": "2025-01-01T00:00:00.000Z",
  "employmentStartDate": "2025-01-02T00:00:00.000Z",
  "employmentEndDate": null,
  "ignoreExamsBefore": null,
  "notes": "Observações do vínculo",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 6.2 Listar Vínculos

**GET** `/employments`

**Query Params:**
- `workerId` (opcional): Filtrar por trabalhador
- `companyId` (opcional): Filtrar por empresa
- `jobId` (opcional): Filtrar por cargo
- `active` (opcional): true/false (vínculos sem data de término)

**Response 200:** Array de employment objects com relações

---

### 6.3 Buscar Vínculo por ID

**GET** `/employments/:id`

**Response 200:** Employment object com worker, company e job

---

### 6.4 Atualizar Vínculo

**PATCH** `/employments/:id`

**Request Body:**
```json
{
  "registration": "54321",
  "notes": "Novas observações"
}
```

**Response 200:** Updated employment object

---

### 6.5 Rescindir Vínculo

**PATCH** `/employments/:id/terminate`

**Request Body:**
```json
{
  "employmentEndDate": "2025-12-31"
}
```

**Response 200:** Employment object com data de término

---

### 6.6 Excluir Vínculo

**DELETE** `/employments/:id`

**Response 200:**
```json
{
  "message": "Vínculo removido com sucesso"
}
```

---

### 6.7 Verificar Rescisão

**GET** `/employments/:id/check-terminated`

**Response 200:**
```json
{
  "isTerminated": false,
  "employmentEndDate": null
}
```

---

## 7. PROCEDIMENTOS

### 7.1 Criar Procedimento

**POST** `/procedures`

**Request Body:**
```json
{
  "code": "AUDIO001",
  "name": "Audiometria Tonal",
  "description": "Exame de audiometria tonal ocupacional",
  "type": "COMPLEMENTARY",
  "defaultPrice": 15000,
  "durationMinutes": 30,
  "active": true
}
```

**Response 201:** Procedure object

---

### 7.2 Listar Procedimentos

**GET** `/procedures`

**Query Params:**
- `type` (opcional): CLINICAL, LAB, IMAGE, DOCUMENT, OTHER
- `active` (opcional): true/false

**Response 200:** Array de procedure objects

---

### 7.3 Buscar Procedimentos

**GET** `/procedures/search`

**Query Params:**
- `q`: Termo de busca (nome ou descrição)

**Exemplo:** `/procedures/search?q=audio`

**Response 200:** Array de procedures matching

---

### 7.4 Buscar por Código

**GET** `/procedures/code/:code`

**Exemplo:** `/procedures/code/AUDIO001`

**Response 200:** Procedure object

---

### 7.5 Buscar Procedimento por ID

**GET** `/procedures/:id`

**Response 200:** Procedure object

---

### 7.6 Atualizar Procedimento

**PATCH** `/procedures/:id`

**Request Body:**
```json
{
  "defaultPrice": 18000,
  "durationMinutes": 40
}
```

**Response 200:** Updated procedure object

---

### 7.7 Excluir Procedimento (Soft Delete)

**DELETE** `/procedures/:id`

**Response 200:**
```json
{
  "message": "Procedimento removido com sucesso"
}
```

---

## 8. AGENDAMENTOS

### 8.1 Criar Agendamento

**POST** `/appointments`

**Request Body:**
```json
{
  "workerId": "cm3worker1",
  "companyId": "cm3company1",
  "employmentId": "cm3employment1",
  "jobId": "cm3job1",
  "roomId": "cm3room1",
  "context": "ADMISSIONAL",
  "appointmentDate": "2025-01-15T09:00:00.000Z",
  "scheduledAt": "2025-01-15T09:00:00.000Z",
  "status": "TO_COME",
  "notes": "Agendamento para exame admissional"
}
```

**Response 201:** Appointment object

---

### 8.2 Listar Agendamentos

**GET** `/appointments`

**Query Params:**
- `workerId` (opcional)
- `companyId` (opcional)
- `roomId` (opcional)
- `status` (opcional): TO_COME, WAITING, IN_SERVICE, DONE, RESCHEDULED, CANCELLED
- `context` (opcional): ADMISSIONAL, PERIODICO, RETORNO_AO_TRABALHO, etc.
- `date` (opcional): Data específica (YYYY-MM-DD)

**Response 200:** Array de appointment objects com relações

---

### 8.3 Sala de Espera

**GET** `/appointments/waiting-room`

Retorna agendamentos com status WAITING.

**Response 200:** Array de appointments waiting

---

### 8.4 Buscar Agendamento por ID

**GET** `/appointments/:id`

**Response 200:** Appointment object completo

---

### 8.5 Atualizar Agendamento

**PATCH** `/appointments/:id`

**Request Body:**
```json
{
  "appointmentDate": "2025-01-16T10:00:00.000Z",
  "notes": "Remarcado a pedido do paciente"
}
```

**Response 200:** Updated appointment object

---

### 8.6 Alterar Status

**PATCH** `/appointments/:id/status/:newStatus`

**Exemplo:** `PATCH /appointments/cm3appt1/status/IN_SERVICE`

**Response 200:** Appointment object com status atualizado

---

### 8.7 Adicionar Procedimento

**POST** `/appointments/:id/procedures`

**Request Body:**
```json
{
  "procedureId": "cm3proc1",
  "responsibleUserId": "cm3user1"
}
```

**Response 201:** AppointmentProcedure object

---

### 8.8 Remover Procedimento

**DELETE** `/appointments/:appointmentId/procedures/:procedureId`

**Response 200:**
```json
{
  "message": "Procedimento removido do agendamento"
}
```

---

### 8.9 Excluir Agendamento

**DELETE** `/appointments/:id`

**Response 200:**
```json
{
  "message": "Agendamento removido com sucesso"
}
```

---

## 9. DOCUMENTOS

### 9.1 Criar Documento

**POST** `/documents`

**Request Body:**
```json
{
  "workerId": "cm3worker1",
  "companyId": "cm3company1",
  "employmentId": "cm3employment1",
  "jobId": "cm3job1",
  "type": "ASO",
  "context": "ADMISSIONAL",
  "status": "DRAFT",
  "issueDate": "2025-01-15",
  "expirationDate": "2026-01-15",
  "asoConclusion": "APTO",
  "notes": "Funcionário apto para o cargo"
}
```

**Response 201:** Document object

---

### 9.2 Listar Documentos

**GET** `/documents`

**Query Params:**
- `workerId` (opcional)
- `companyId` (opcional)
- `employmentId` (opcional)
- `type` (opcional): ASO, FICHA_CLINICA, AUDIOGRAMA, ENCAMINHAMENTO, OUTRO
- `status` (opcional): DRAFT, FINALIZED
- `context` (opcional)

**Response 200:** Array de document objects com relações

---

### 9.3 Documentos Demissionais

**GET** `/documents/dismissal`

Retorna documentos com `dismissEmployee: true`.

**Response 200:** Array de dismissal documents

---

### 9.4 Buscar Documento por ID

**GET** `/documents/:id`

**Response 200:** Document object completo com files

---

### 9.5 Atualizar Documento

**PATCH** `/documents/:id`

**Request Body:**
```json
{
  "notes": "Novas observações",
  "expirationDate": "2026-06-15"
}
```

**Response 200:** Updated document object

---

### 9.6 Finalizar Documento

**POST** `/documents/:id/finalize`

Finaliza um documento (DRAFT → FINALIZED).

**Request Body:**
```json
{
  "issuerDoctorId": "cm3doctor1",
  "pcmsDoctorId": "cm3doctor2"
}
```

**Response 200:** Document object com status FINALIZED

---

### 9.7 Excluir Documento

**DELETE** `/documents/:id`

**Response 200:**
```json
{
  "message": "Documento removido com sucesso"
}
```

---

## 10. ARQUIVOS

### 10.1 Upload de Arquivo

**POST** `/files/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Arquivo (obrigatório)
- `documentId`: ID do documento (obrigatório)
- `ownerType`: DOCUMENT, WORKER, COMPANY, OTHER (opcional)
- `ownerId`: ID do owner (opcional)
- `category`: Categoria do arquivo (opcional)

**Response 201:**
```json
{
  "id": "cm3file1",
  "ownerType": "DOCUMENT",
  "ownerId": "cm3doc1",
  "documentId": "cm3doc1",
  "category": "ASO",
  "filename": "aso_1234567890.pdf",
  "originalName": "aso_joao_silva.pdf",
  "mimetype": "application/pdf",
  "mimeType": "application/pdf",
  "size": 245678,
  "path": "/uploads/documents/aso_1234567890.pdf",
  "uploadedAt": "2025-01-01T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 10.2 Listar Arquivos

**GET** `/files`

**Query Params:**
- `ownerType` (opcional)
- `ownerId` (opcional)
- `documentId` (opcional)
- `category` (opcional)

**Response 200:** Array de file objects

---

### 10.3 Estatísticas de Arquivos

**GET** `/files/stats`

**Response 200:**
```json
{
  "totalFiles": 1523,
  "totalSize": 5234567890,
  "byType": {
    "application/pdf": 1200,
    "image/jpeg": 250,
    "image/png": 73
  },
  "byOwnerType": {
    "DOCUMENT": 1400,
    "WORKER": 80,
    "COMPANY": 43
  }
}
```

---

### 10.4 Buscar Arquivo por ID

**GET** `/files/:id`

**Response 200:** File object

---

### 10.5 Download de Arquivo

**GET** `/files/:id/download`

**Response 200:** File stream (binary)

**Headers:**
- `Content-Type`: mimetype do arquivo
- `Content-Disposition`: `attachment; filename="original_name.ext"`

---

### 10.6 Excluir Arquivo

**DELETE** `/files/:id`

Exclui o arquivo do banco e do sistema de arquivos.

**Response 200:**
```json
{
  "message": "Arquivo removido com sucesso"
}
```

---

## 11. UNIDADES CLÍNICAS

### 11.1 Criar Unidade

**POST** `/clinic-units`

**Request Body:**
```json
{
  "name": "Unidade Centro",
  "code": "UN001",
  "address": "Rua Central, 500 - Centro",
  "phone": "(11) 3333-4444",
  "active": true
}
```

**Response 201:** ClinicUnit object

---

### 11.2 Listar Unidades

**GET** `/clinic-units`

**Query Params:**
- `active` (opcional): true/false

**Response 200:** Array de clinic units com contagem de rooms

---

### 11.3 Buscar Unidade por ID

**GET** `/clinic-units/:id`

**Response 200:** ClinicUnit object com rooms

---

### 11.4 Atualizar Unidade

**PATCH** `/clinic-units/:id`

**Request Body:**
```json
{
  "phone": "(11) 3333-5555",
  "address": "Rua Central, 600 - Centro"
}
```

**Response 200:** Updated clinic unit object

---

### 11.5 Excluir Unidade (Soft Delete)

**DELETE** `/clinic-units/:id`

**Response 200:**
```json
{
  "message": "Unidade clínica removida com sucesso"
}
```

---

## 12. SALAS

### 12.1 Criar Sala

**POST** `/rooms`

**Request Body:**
```json
{
  "name": "Sala 101",
  "description": "Sala de consulta médica",
  "type": "CONSULTATION",
  "clinicUnitId": "cm3unit1",
  "active": true
}
```

**Response 201:** Room object

---

### 12.2 Listar Salas

**GET** `/rooms`

**Query Params:**
- `clinicUnitId` (opcional): Filtrar por unidade
- `type` (opcional): RECEPTION, CONSULTATION, EXAM, VACCINE, WAITING
- `active` (opcional): true/false

**Response 200:** Array de room objects

---

### 12.3 Buscar Sala por ID

**GET** `/rooms/:id`

**Response 200:** Room object com clinic unit

---

### 12.4 Atualizar Sala

**PATCH** `/rooms/:id`

**Request Body:**
```json
{
  "name": "Sala 101-A",
  "description": "Sala de consulta médica especializada"
}
```

**Response 200:** Updated room object

---

### 12.5 Excluir Sala (Soft Delete)

**DELETE** `/rooms/:id`

**Response 200:**
```json
{
  "message": "Sala removida com sucesso"
}
```

---

## 13. MAPEAMENTO DE RISCOS

### 13.1 Categorias de Risco

#### 13.1.1 Criar Categoria

**POST** `/mapping/risk-categories`

**Request Body:**
```json
{
  "name": "Físico",
  "description": "Riscos físicos ocupacionais",
  "color": "#FF5733",
  "icon": "sun"
}
```

**Response 201:** RiskCategory object

---

#### 13.1.2 Listar Categorias

**GET** `/mapping/risk-categories`

**Response 200:** Array de risk categories com contagem de risks

---

#### 13.1.3 Buscar Categoria por ID

**GET** `/mapping/risk-categories/:id`

**Response 200:** RiskCategory object com risks

---

#### 13.1.4 Atualizar Categoria

**PATCH** `/mapping/risk-categories/:id`

**Response 200:** Updated risk category object

---

#### 13.1.5 Excluir Categoria

**DELETE** `/mapping/risk-categories/:id`

**Response 200:**
```json
{
  "message": "Categoria removida com sucesso"
}
```

---

### 13.2 Riscos

#### 13.2.1 Criar Risco

**POST** `/mapping/risks`

**Request Body:**
```json
{
  "categoryId": "cm3riskcat1",
  "type": "PHYSICAL",
  "code": "01.01.001",
  "name": "Ruído contínuo ou intermitente acima de 85 dB(A)",
  "description": "Exposição a ruído ocupacional",
  "sourceGenerator": "Máquinas industriais, prensas, compressores",
  "healthEffects": "Perda auditiva induzida por ruído (PAIR)",
  "controlMeasures": "EPI: Protetor auricular tipo concha ou plug",
  "allowsIntensity": true,
  "isGlobal": true,
  "active": true
}
```

**Response 201:** Risk object

---

#### 13.2.2 Listar Riscos

**GET** `/mapping/risks`

**Query Params:**
- `categoryId` (opcional)
- `type` (opcional): PHYSICAL, CHEMICAL, BIOLOGICAL, ERGONOMIC, ACCIDENT
- `active` (opcional): true/false
- `search` (opcional): Busca por nome/descrição

**Response 200:** Array de risk objects com category

---

#### 13.2.3 Buscar Risco por ID

**GET** `/mapping/risks/:id`

**Response 200:** Risk object completo

---

#### 13.2.4 Atualizar Risco

**PATCH** `/mapping/risks/:id`

**Response 200:** Updated risk object

---

#### 13.2.5 Excluir Risco (Soft Delete)

**DELETE** `/mapping/risks/:id`

**Response 200:**
```json
{
  "message": "Risco removido com sucesso"
}
```

---

### 13.3 Ambientes (GHE)

#### 13.3.1 Criar Ambiente

**POST** `/mapping/environments`

**Request Body:**
```json
{
  "companyId": "cm3company1",
  "name": "Setor de Produção",
  "locationType": "EMPLOYER_ESTABLISHMENT",
  "description": "Área de produção industrial",
  "color": "#3498db",
  "icon": "factory",
  "registeredInESocial": false,
  "active": true
}
```

**Response 201:** Environment object

---

#### 13.3.2 Listar Ambientes

**GET** `/mapping/environments`

**Query Params:**
- `companyId` (obrigatório)
- `locationType` (opcional)
- `active` (opcional)
- `registeredInESocial` (opcional)

**Response 200:** Array de environment objects

---

#### 13.3.3 Buscar Ambiente por ID

**GET** `/mapping/environments/:id`

**Response 200:** Environment object com risks

---

#### 13.3.4 Atualizar Ambiente

**PATCH** `/mapping/environments/:id`

**Response 200:** Updated environment object

---

#### 13.3.5 Excluir Ambiente (Soft Delete)

**DELETE** `/mapping/environments/:id`

**Response 200:**
```json
{
  "message": "Ambiente removido com sucesso"
}
```

---

#### 13.3.6 Adicionar Risco ao Ambiente

**POST** `/mapping/environments/:id/risks`

**Request Body:**
```json
{
  "riskId": "cm3risk1",
  "intensity": "HIGH",
  "notes": "Exposição contínua durante toda jornada"
}
```

**Response 201:** EnvironmentRisk object

---

#### 13.3.7 Remover Risco do Ambiente

**DELETE** `/mapping/environments/:id/risks/:riskId`

**Response 200:**
```json
{
  "message": "Risco removido do ambiente"
}
```

---

#### 13.3.8 Listar Riscos do Ambiente

**GET** `/mapping/environments/:id/risks`

**Response 200:** Array de environment risks com risk e category

---

### 13.4 Mapeamento de Cargos

#### 13.4.1 Listar Ambientes do Cargo

**GET** `/mapping/jobs/:id/environments`

**Response 200:** Array de job environments

---

#### 13.4.2 Adicionar Ambiente ao Cargo

**POST** `/mapping/jobs/:id/environments`

**Request Body:**
```json
{
  "environmentId": "cm3env1"
}
```

**Response 201:** JobEnvironment object

---

#### 13.4.3 Remover Ambiente do Cargo

**DELETE** `/mapping/jobs/:jobId/environments/:environmentId`

**Response 200:**
```json
{
  "message": "Ambiente removido do cargo"
}
```

---

#### 13.4.4 Definir Ambiente Principal

**PATCH** `/mapping/jobs/:id/main-environment`

**Request Body:**
```json
{
  "mainEnvironmentId": "cm3env1"
}
```

**Response 200:** Updated job object

---

#### 13.4.5 Listar Riscos do Cargo

**GET** `/mapping/jobs/:id/risks`

**Response 200:** Array de job risks com risk e category

---

#### 13.4.6 Adicionar Risco ao Cargo

**POST** `/mapping/jobs/:id/risks`

**Request Body:**
```json
{
  "riskId": "cm3risk1",
  "intensity": "MEDIUM",
  "notes": "Exposição ocasional"
}
```

**Response 201:** JobRisk object

---

#### 13.4.7 Remover Risco do Cargo

**DELETE** `/mapping/jobs/:jobId/risks/:riskId`

**Response 200:**
```json
{
  "message": "Risco removido do cargo"
}
```

---

#### 13.4.8 Atualizar Risco do Cargo

**PATCH** `/mapping/jobs/:jobId/risks/:riskId`

**Request Body:**
```json
{
  "intensity": "HIGH",
  "notes": "Exposição contínua"
}
```

**Response 200:** Updated job risk object

---

#### 13.4.9 Listar Exames do Cargo

**GET** `/mapping/jobs/:id/exams`

**Response 200:** Array de job exams

---

#### 13.4.10 Adicionar Exame ao Cargo

**POST** `/mapping/jobs/:id/exams`

**Request Body:**
```json
{
  "examName": "Audiometria Tonal",
  "notes": "Obrigatório devido exposição a ruído"
}
```

**Response 201:** JobExam object

---

#### 13.4.11 Remover Exame do Cargo

**DELETE** `/mapping/jobs/:jobId/exams/:examName`

**Response 200:**
```json
{
  "message": "Exame removido do cargo"
}
```

---

#### 13.4.12 Buscar Notas do Cargo

**GET** `/mapping/jobs/:id/notes`

**Response 200:**
```json
{
  "id": "cm3jobnotes1",
  "jobId": "cm3job1",
  "activities": "Descrição das atividades",
  "generalRecommendations": "Recomendações gerais",
  "ergonomicMethodology": "Metodologia ergonômica aplicada",
  "generalObservations": "Observações gerais",
  "technicalOpinionLTCAT": "Parecer técnico LTCAT",
  "technicalOpinionDanger": "Parecer de periculosidade",
  "technicalOpinionInsalubrity": "Parecer de insalubridade",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 13.4.13 Atualizar Notas do Cargo

**PATCH** `/mapping/jobs/:id/notes`

**Request Body:**
```json
{
  "activities": "Descrição atualizada das atividades",
  "generalRecommendations": "Novas recomendações"
}
```

**Response 200:** Updated job notes object

---

## 14. EXAMES OCUPACIONAIS

### 14.1 Criar Exame

**POST** `/exams`

**Request Body:**
```json
{
  "name": "Audiometria Tonal",
  "description": "Exame audiométrico ocupacional para avaliação da acuidade auditiva",
  "category": "COMPLEMENTARY",
  "table27Codes": ["05.01.01.003"],
  "insertIntoASO": true,
  "requiresJustification": false,
  "active": true
}
```

**Response 201:**
```json
{
  "id": "cm3exam1",
  "name": "Audiometria Tonal",
  "description": "Exame audiométrico ocupacional para avaliação da acuidade auditiva",
  "category": "COMPLEMENTARY",
  "table27Codes": ["05.01.01.003"],
  "insertIntoASO": true,
  "requiresJustification": false,
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 14.2 Listar Exames

**GET** `/exams`

**Query Params:**
- `category` (opcional): CLINICAL, LABORATORY, IMAGING, COMPLEMENTARY, PSYCHOSOCIAL, FUNCTIONAL, OTHER
- `active` (opcional): true/false
- `search` (opcional): Busca por nome/descrição
- `table27Code` (opcional): Filtrar por código Tabela 27

**Response 200:** Array de examination objects

---

### 14.3 Buscar Exames

**GET** `/exams/search`

**Query Params:**
- `q`: Termo de busca (obrigatório)

**Exemplo:** `/exams/search?q=audio`

**Response 200:** Array de exames (limit 50)

---

### 14.4 Listar Códigos Tabela 27

**GET** `/exams/table27`

Retorna todos os códigos Tabela 27 únicos em uso.

**Response 200:**
```json
[
  "05.01.01.003",
  "06.02.03.001",
  "07.01.02.004"
]
```

---

### 14.5 Validar Códigos Tabela 27

**POST** `/exams/table27/validate`

**Request Body:**
```json
{
  "codes": ["05.01.01.003", "99.99.99.999"]
}
```

**Response 200:**
```json
{
  "valid": true,
  "invalidCodes": ["99.99.99.999"]
}
```

---

### 14.6 Buscar Exame por ID

**GET** `/exams/:id`

**Response 200:** Examination object com risk/job rules e counts

---

### 14.7 Atualizar Exame

**PATCH** `/exams/:id`

**Request Body:**
```json
{
  "description": "Nova descrição",
  "active": false
}
```

**Response 200:** Updated examination object

---

### 14.8 Excluir Exame (Soft Delete)

**DELETE** `/exams/:id`

Apenas exames sem regras ativas podem ser excluídos.

**Response 200:**
```json
{
  "message": "Exame removido com sucesso"
}
```

---

## 15. REGRAS DE EXAMES

### 15.1 Regras por Risco

#### 15.1.1 Criar Regra de Risco

**POST** `/exams/risk-rules`

**Request Body:**
```json
{
  "riskId": "cm3risk1",
  "examId": "cm3exam1",
  "periodicityType": "PERIODIC",
  "periodicityValue": 12,
  "applicableOnAdmission": true,
  "applicableOnDismissal": false,
  "applicableOnReturn": true,
  "applicableOnChange": true,
  "applicablePeriodic": true,
  "justification": "NR-7 - Exame obrigatório para exposição a ruído",
  "notes": "Realizar anualmente",
  "active": true
}
```

**Response 201:** ExamRuleByRisk object

---

#### 15.1.2 Listar Regras de Risco

**GET** `/exams/risk-rules`

**Query Params:**
- `riskId` (opcional)
- `examId` (opcional)
- `active` (opcional)
- `periodicityType` (opcional)

**Response 200:** Array de risk exam rules

---

#### 15.1.3 Buscar Regras por Risco

**GET** `/exams/risk-rules/risk/:riskId`

**Response 200:** Array de rules para aquele risco

---

#### 15.1.4 Buscar Regra por ID

**GET** `/exams/risk-rules/:id`

**Response 200:** ExamRuleByRisk object

---

#### 15.1.5 Atualizar Regra

**PATCH** `/exams/risk-rules/:id`

**Request Body:**
```json
{
  "periodicityValue": 6,
  "notes": "Alterado para semestral"
}
```

**Response 200:** Updated risk exam rule

---

#### 15.1.6 Excluir Regra (Soft Delete)

**DELETE** `/exams/risk-rules/:id`

**Response 200:**
```json
{
  "message": "Regra de exame removida"
}
```

---

### 15.2 Regras por Cargo

#### 15.2.1 Criar Regra de Cargo

**POST** `/exams/job-rules`

**Request Body:**
```json
{
  "jobId": "cm3job1",
  "examId": "cm3exam1",
  "periodicityType": "PERIODIC",
  "periodicityValue": 12,
  "applicableOnAdmission": true,
  "applicableOnDismissal": true,
  "applicableOnReturn": true,
  "applicableOnChange": false,
  "applicablePeriodic": true,
  "overrideRiskRules": false,
  "insertIntoASO": true,
  "justification": "Exame específico para este cargo",
  "notes": "Realizar anualmente",
  "active": true
}
```

**Response 201:** ExamRuleByJob object

---

#### 15.2.2 Listar Regras de Cargo

**GET** `/exams/job-rules`

**Query Params:**
- `jobId` (opcional)
- `examId` (opcional)
- `active` (opcional)
- `periodicityType` (opcional)

**Response 200:** Array de job exam rules

---

#### 15.2.3 Buscar Regras por Cargo

**GET** `/exams/job-rules/job/:jobId`

**Response 200:** Array de rules para aquele cargo

---

#### 15.2.4 Buscar Regras Consolidadas

**GET** `/exams/job-rules/job/:jobId/consolidated`

Retorna regras do cargo + regras dos riscos associados (consolidado).

**Response 200:**
```json
{
  "job": { /* job object */ },
  "jobRules": [ /* array de job rules */ ],
  "riskRules": [ /* array de risk rules dos riscos do cargo */ ],
  "consolidated": [ /* array consolidado sem duplicatas */ ],
  "overrides": [ /* regras de cargo que sobrescrevem regras de risco */ ]
}
```

---

#### 15.2.5 Buscar Regra por ID

**GET** `/exams/job-rules/:id`

**Response 200:** ExamRuleByJob object

---

#### 15.2.6 Atualizar Regra

**PATCH** `/exams/job-rules/:id`

**Request Body:**
```json
{
  "periodicityValue": 6,
  "overrideRiskRules": true
}
```

**Response 200:** Updated job exam rule

---

#### 15.2.7 Excluir Regra (Soft Delete)

**DELETE** `/exams/job-rules/:id`

**Response 200:**
```json
{
  "message": "Regra de exame removida"
}
```

---

## 16. PCMSO

### 16.1 Gerar Rascunho de PCMSO

**POST** `/exams/pcmso/company/:companyId/generate`

Gera uma nova versão em rascunho do PCMSO.

**Request Body (opcional):**
```json
{
  "title": "PCMSO 2025",
  "generateWithAI": false
}
```

**Response 201:**
```json
{
  "id": "cm3pcmso1",
  "companyId": "cm3company1",
  "versionNumber": 1,
  "status": "DRAFT",
  "title": "PCMSO 2025",
  "contentHtml": null,
  "generatedByAI": false,
  "aiModel": null,
  "generatedAt": "2025-01-01T00:00:00.000Z",
  "signedAt": null,
  "signedByUserId": null,
  "signatureHash": null,
  "diffFromPrevious": null,
  "changesSummary": "Primeira versão do PCMSO",
  "mappingChangedAfterSign": false,
  "notes": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "_count": {
    "examRequirements": 15
  }
}
```

---

### 16.2 Detectar Mudanças no Mapeamento

**GET** `/exams/pcmso/company/:companyId/detect-changes`

Detecta mudanças no mapeamento desde a última versão assinada.

**Response 200:**
```json
{
  "hasChanges": true,
  "lastSignedVersion": { /* última versão assinada */ },
  "changes": [
    {
      "type": "JOB_ADDED",
      "description": "Cargo 'Operador de Máquinas' adicionado"
    },
    {
      "type": "RISK_REMOVED",
      "description": "Risco 'Calor' removido do cargo 'Soldador'"
    },
    {
      "type": "EXAM_RULE_CHANGED",
      "description": "Periodicidade do exame 'Audiometria' alterada de 12 para 6 meses"
    }
  ],
  "affectedJobs": ["cm3job1", "cm3job2"],
  "affectedRisks": ["cm3risk1"],
  "affectedExams": ["cm3exam1"]
}
```

---

### 16.3 Buscar PCMSO por ID

**GET** `/exams/pcmso/:id`

**Response 200:** PCMSOVersion object completo com exam requirements

---

### 16.4 Listar Versões do PCMSO

**GET** `/exams/pcmso/company/:companyId/versions`

**Query Params:**
- `status` (opcional): DRAFT, UNDER_REVIEW, SIGNED, ARCHIVED, OUTDATED

**Response 200:** Array de PCMSO versions

---

### 16.5 Atualizar PCMSO

**PATCH** `/exams/pcmso/:id`

Apenas versões DRAFT ou UNDER_REVIEW podem ser editadas.

**Request Body:**
```json
{
  "title": "PCMSO 2025 - Revisado",
  "contentHtml": "<h1>PCMSO</h1><p>Conteúdo HTML...</p>",
  "notes": "Revisão após feedback da equipe"
}
```

**Response 200:** Updated PCMSO version

---

### 16.6 Assinar PCMSO

**POST** `/exams/pcmso/:id/sign`

Assina digitalmente o PCMSO (DRAFT/UNDER_REVIEW → SIGNED).

**Request Body:**
```json
{
  "signedByUserId": "cm3doctor1"
}
```

**Response 200:** PCMSO version com status SIGNED e signatureHash (SHA256)

---

### 16.7 Arquivar PCMSO

**POST** `/exams/pcmso/:id/archive`

Arquiva uma versão assinada (SIGNED → ARCHIVED).

**Response 200:** PCMSO version com status ARCHIVED

---

### 16.8 Validar Conformidade NR-7

**GET** `/exams/pcmso/:id/validate-nr7`

Valida conformidade do PCMSO com NR-7.

**Response 200:**
```json
{
  "isCompliant": false,
  "errors": [
    "NR-7: Cargo 'Operador' exposto a ruído acima de 85 dB(A) requer Audiometria Tonal obrigatória"
  ],
  "warnings": [
    "Recomenda-se adicionar exame de visão para cargos com uso de computador"
  ],
  "suggestions": [
    "Considere adicionar exame toxicológico para motoristas"
  ]
}
```

---

### 16.9 Diff entre Versões

**GET** `/exams/pcmso/:id/diff/:previousId`

Retorna diff estruturado entre duas versões.

**Response 200:**
```json
{
  "currentVersion": { /* current PCMSO version */ },
  "previousVersion": { /* previous PCMSO version */ },
  "diff": {
    "examsAdded": [
      {
        "examId": "cm3exam1",
        "examName": "Audiometria Tonal"
      }
    ],
    "examsRemoved": [],
    "examsChanged": [
      {
        "examId": "cm3exam2",
        "examName": "Hemograma",
        "changes": {
          "periodicityValue": {
            "old": 12,
            "new": 6
          }
        }
      }
    ],
    "jobsAffected": ["cm3job1"],
    "risksAffected": ["cm3risk1"]
  }
}
```

---

## 17. TIPOS E ENUMS

### 17.1 User Roles

```typescript
enum UserRole {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  RECEPTIONIST = "RECEPTIONIST",
  TECHNICIAN = "TECHNICIAN"
}
```

**Descrição:**
- `ADMIN`: Administrador do sistema (acesso total)
- `DOCTOR`: Médico (pode finalizar documentos, assinar PCMSO)
- `RECEPTIONIST`: Recepcionista (agendamentos, cadastros)
- `TECHNICIAN`: Técnico (mapeamento de riscos, PCMSO)

---

### 17.2 Gender

```typescript
enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}
```

---

### 17.3 Employment Type

```typescript
enum EmploymentType {
  WITH_EMPLOYMENT = "WITH_EMPLOYMENT",           // Com vínculo empregatício
  TSVE_WITH_REG = "TSVE_WITH_REG",              // TSVE com registro
  TSVE_NO_REG = "TSVE_NO_REG"                   // TSVE sem registro
}
```

---

### 17.4 Procedure Type

```typescript
enum ProcedureType {
  CLINICAL = "CLINICAL",       // Clínico
  LAB = "LAB",                 // Laboratorial
  IMAGE = "IMAGE",             // Imagem
  DOCUMENT = "DOCUMENT",       // Documento
  OTHER = "OTHER"              // Outro
}
```

---

### 17.5 Appointment Context

```typescript
enum AppointmentContext {
  ADMISSIONAL = "ADMISSIONAL",                 // Admissional
  PERIODICO = "PERIODICO",                     // Periódico
  RETORNO_AO_TRABALHO = "RETORNO_AO_TRABALHO", // Retorno ao trabalho
  MUDANCA_DE_FUNCAO = "MUDANCA_DE_FUNCAO",     // Mudança de função
  DEMISSIONAL = "DEMISSIONAL",                 // Demissional
  PONTUAL = "PONTUAL"                          // Pontual
}
```

---

### 17.6 Appointment Status

```typescript
enum AppointmentStatus {
  TO_COME = "TO_COME",           // A vir
  WAITING = "WAITING",           // Aguardando
  IN_SERVICE = "IN_SERVICE",     // Em atendimento
  DONE = "DONE",                 // Concluído
  RESCHEDULED = "RESCHEDULED",   // Remarcado
  CANCELLED = "CANCELLED"        // Cancelado
}
```

---

### 17.7 Document Type

```typescript
enum DocumentType {
  ASO = "ASO",                    // Atestado de Saúde Ocupacional
  FICHA_CLINICA = "FICHA_CLINICA", // Ficha Clínica
  AUDIOGRAMA = "AUDIOGRAMA",      // Audiograma
  ENCAMINHAMENTO = "ENCAMINHAMENTO", // Encaminhamento
  OUTRO = "OUTRO"                 // Outro
}
```

---

### 17.8 Document Status

```typescript
enum DocumentStatus {
  DRAFT = "DRAFT",           // Rascunho
  FINALIZED = "FINALIZED"    // Finalizado
}
```

---

### 17.9 ASO Conclusion

```typescript
enum AsoConclusion {
  APTO = "APTO",                         // Apto
  INAPTO = "INAPTO",                     // Inapto
  APTO_COM_RESTRICAO = "APTO_COM_RESTRICAO" // Apto com restrição
}
```

---

### 17.10 Room Type

```typescript
enum RoomType {
  RECEPTION = "RECEPTION",       // Recepção
  CONSULTATION = "CONSULTATION", // Consultório
  EXAM = "EXAM",                 // Sala de exame
  VACCINE = "VACCINE",           // Sala de vacina
  WAITING = "WAITING"            // Sala de espera
}
```

---

### 17.11 Risk Type

```typescript
enum RiskType {
  PHYSICAL = "PHYSICAL",       // Físico
  CHEMICAL = "CHEMICAL",       // Químico
  BIOLOGICAL = "BIOLOGICAL",   // Biológico
  ERGONOMIC = "ERGONOMIC",     // Ergonômico
  ACCIDENT = "ACCIDENT"        // Acidente
}
```

---

### 17.12 Risk Intensity

```typescript
enum RiskIntensity {
  LOW = "LOW",           // Baixa
  MEDIUM = "MEDIUM",     // Média
  HIGH = "HIGH",         // Alta
  VERY_HIGH = "VERY_HIGH" // Muito alta
}
```

---

### 17.13 Environment Location Type

```typescript
enum EnvironmentLocationType {
  EMPLOYER_ESTABLISHMENT = "EMPLOYER_ESTABLISHMENT",     // Estabelecimento do empregador
  THIRD_PARTY_ESTABLISHMENT = "THIRD_PARTY_ESTABLISHMENT", // Estabelecimento de terceiros
  MOBILE = "MOBILE"                                      // Móvel
}
```

---

### 17.14 Exam Category

```typescript
enum ExamCategory {
  CLINICAL = "CLINICAL",           // Clínico
  LABORATORY = "LABORATORY",       // Laboratorial
  IMAGING = "IMAGING",             // Imagem
  COMPLEMENTARY = "COMPLEMENTARY", // Complementar
  PSYCHOSOCIAL = "PSYCHOSOCIAL",   // Psicossocial
  FUNCTIONAL = "FUNCTIONAL",       // Funcional
  OTHER = "OTHER"                  // Outro
}
```

---

### 17.15 Periodicity Type

```typescript
enum PeriodicityType {
  NONE = "NONE",               // Sem periodicidade
  ON_ADMISSION = "ON_ADMISSION", // Admissional
  ON_DISMISSAL = "ON_DISMISSAL", // Demissional
  ON_RETURN = "ON_RETURN",     // Retorno ao trabalho
  ON_CHANGE = "ON_CHANGE",     // Mudança de risco
  PERIODIC = "PERIODIC",       // Periódico
  CUSTOM = "CUSTOM"            // Customizado
}
```

---

### 17.16 Exam Source Type

```typescript
enum ExamSourceType {
  RISK = "RISK",               // Originado de risco
  JOB = "JOB",                 // Originado de cargo
  MANUAL = "MANUAL",           // Adicionado manualmente
  AI_SUGGESTION = "AI_SUGGESTION", // Sugestão da IA
  NR7_REQUIREMENT = "NR7_REQUIREMENT" // Exigência NR-7
}
```

---

### 17.17 PCMSO Status

```typescript
enum PCMSOStatus {
  DRAFT = "DRAFT",               // Rascunho (editável)
  UNDER_REVIEW = "UNDER_REVIEW", // Em revisão
  SIGNED = "SIGNED",             // Assinado (imutável)
  ARCHIVED = "ARCHIVED",         // Arquivado
  OUTDATED = "OUTDATED"          // Desatualizado
}
```

---

## 📚 NOTAS IMPORTANTES

### Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem autenticação via JWT.

**Header obrigatório:**
```
Authorization: Bearer {accessToken}
```

### IDs

Todos os IDs são strings CUID (ex: `cm3abc123`), não números.

### Datas

Todas as datas são retornadas no formato ISO 8601:
```
2025-01-01T00:00:00.000Z
```

### Paginação

Atualmente não há paginação implementada. Todos os endpoints retornam todos os registros.

### Soft Delete

A maioria dos recursos usa soft delete (`active: false`), não exclusão física.

### Validação

Todos os endpoints validam os dados usando DTOs com `class-validator`.

### Erros

Erros são retornados no formato:
```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "error": "Bad Request"
}
```

---

## 📞 SUPORTE

- **Swagger:** http://localhost:3000/api/docs
- **Documentação:** Ver arquivos `*.md` na raiz do projeto
- **Issues:** Reportar no repositório

---

**Última Atualização:** 03/12/2025
**Versão da API:** 1.0.0
**Versão do Backend:** NestJS 10.x
