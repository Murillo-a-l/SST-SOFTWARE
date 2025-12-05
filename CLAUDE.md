# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANTE: MIGRAÇÃO PARA NESTJS CONCLUÍDA + MÓDULO MAPPING (01/12/2025)

**O sistema migrou do backend Express para NestJS e agora inclui módulo completo de Mapeamento de Riscos!**

### Backends no Projeto

Este projeto contém **dois backends**:

1. **🟢 NestJS (ATUAL - EM USO)** - `nestjs-backend/`
   - Porta: **3000**
   - API Base: `http://localhost:3000/api/v1`
   - Status: ✅ **ATIVO E INTEGRADO COM FRONTEND**
   - Database: `ocupalli_test`

2. **🔴 Express (LEGADO - DESCONTINUADO)** - `backend/`
   - Porta: 3001
   - API Base: `http://localhost:3001/api`
   - Status: ⚠️ **DESCONTINUADO - NÃO USAR**
   - Database: `occupational_health`

**📚 Documentação da Migração**: Ver arquivo `MIGRACAO-NESTJS.md` para detalhes completos.

---

## Project Overview

This is an **Occupational Health Management System** (Ocupalli) built as a full-stack application for managing employee occupational health data, medical exams, documents, and billing in Brazil. The application is designed for companies to track employee health compliance (ASOs, PCMSO), manage contracts, and handle financial operations related to occupational health services.

**Key Characteristics:**
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (port 3002)
- **Backend**: NestJS + TypeScript + Prisma ORM (port 3000) ✅ **ATUAL**
- **Database**: PostgreSQL (`ocupalli_test`)
- **Architecture**: Modern NestJS with clean architecture, DTOs, and dependency injection
- Multi-company architecture with full company management
- Integrates with Google Gemini AI for occupational health assistance
- Swagger API documentation at `http://localhost:3000/api/docs`

---

## Build and Development Commands

### Frontend

```bash
# Install dependencies
npm install

# Run development server (runs on http://localhost:3002 or 3003)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Dev Server Configuration:**
- Port: 3002 (primary) or auto-increment if busy
- Host: 0.0.0.0 (accessible from network)
- Hot Module Replacement (HMR) enabled via Vite

### Backend NestJS (ATUAL)

```bash
# Navigate to NestJS backend directory
cd nestjs-backend

# Install dependencies
npm install

# Setup database (first time only)
# 1. Create PostgreSQL database: CREATE DATABASE ocupalli_test;
# 2. Copy .env.example to .env and configure DATABASE_URL
# 3. Run migrations and seed
npm run prisma:generate
npx prisma db push
npm run prisma:seed

# Run development server with hot reload (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Open Prisma Studio (database GUI on http://localhost:5555)
npm run prisma:studio
```

**Backend Features:**
- 17 módulos funcionais (Auth, Users, Companies, Workers, Jobs, Employments, **Mapping**, etc.)
- ~91 endpoints REST (60 originais + 31 mapping)
- JWT authentication with refresh tokens
- **🆕 Módulo Mapping**: Mapeamento completo de riscos ocupacionais (31 endpoints)
- Role-based access control (ADMIN, DOCTOR, RECEPTIONIST, TECHNICIAN)
- Swagger documentation auto-generated
- Validation com class-validator
- Exception handling padronizado

---

## Environment Configuration

### Frontend (.env.local in project root)

```env
# Gemini AI (opcional)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend NestJS URL (OBRIGATÓRIO)
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Important:**
- `VITE_API_BASE_URL` aponta para o backend **NestJS** na porta 3000
- Get Gemini API key from https://ai.google.dev/
- The key is exposed in the browser via `import.meta.env`

### Backend NestJS (nestjs-backend/.env)

```env
# Database
DATABASE_URL="postgresql://postgres:Liloestit013@localhost:5432/ocupalli_test?schema=public"

# JWT Authentication
JWT_SECRET="ocupalli-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="ocupalli-super-secret-refresh-key-change-in-production-2024"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=52428800

# CORS
CORS_ORIGIN="http://localhost:3002"
```

See `nestjs-backend/.env.example` for a template.

---

## Architecture

### Backend NestJS Structure (`nestjs-backend/`)

**Server (`src/main.ts`):**
- NestJS application with Swagger, CORS, Helmet, validation
- Global exception filter
- Runs on port 3000
- API prefix: `/api/v1`

**Modules (`src/modules/`):**
- `auth/` - Authentication (login, logout, refresh, JWT)
- `user/` - User management (CRUD)
- `company/` - Company management (CRUD + delinquency)
- `worker/` - Worker/Employee management (CRUD + CPF search)
- `job/` - Job positions (CRUD + CBO codes)
- `employment/` - Employment relationships (CRUD + termination)
- `procedure/` - Medical procedures catalog
- `appointment/` - Appointments and waiting room
- `document/` - Document management (ASO, PCMSO)
- `file/` - File upload/download
- `clinic-unit/` - Clinic units management
- `room/` - Room management

**Database (`prisma/schema.prisma`):**
- 13 models with full relationships
- Soft deletes with `deletedAt`
- CUID primary keys (strings)
- Timestamps (`createdAt`, `updatedAt`)
- Seed script with test data

**Swagger Documentation:**
- URL: `http://localhost:3000/api/docs`
- Interactive API testing
- Auto-generated from decorators

### Frontend Structure

**API Service Layer (`services/apiService.ts`):**
- Wrapper around backend NestJS REST API
- Uses native fetch (no axios)
- JWT token management via sessionStorage (accessToken + refreshToken)
- Exports: `authApi`, `empresaApi`, `funcionarioApi`
- Error handling with typed `ApiError` class
- **Mudanças principais da migração:**
  - Login: `username` → `email`
  - Token: `token` → `accessToken` + `refreshToken`
  - IDs: `number` → `string` (CUID)
  - Endpoints: `/empresas` → `/companies`, `/funcionarios` → `/workers`

**Type System (`types.ts` + `services/apiService.ts`):**
All TypeScript interfaces are defined in these files. Key types:

**Core Entities (NestJS format):**
- `User`: System users with email-based auth and expanded roles
- `Empresa` (Company): Companies with `corporateName`, `tradeName`, `isDelinquent`
- `Funcionario` (Worker): Employees with `name`, `cpf`, `birthDate`, `gender`

**Mapping Module (New - NestJS Backend):**
The system now includes a complete occupational risk mapping module with 31 endpoints:

**Risk Categories** (`/api/v1/mapping/risk-categories` - 5 endpoints):
- Color-coded risk categorization (Physical, Chemical, Biological, Ergonomic, Accident)
- CRUD operations for risk categories
- Icon and color customization

**Risks** (`/api/v1/mapping/risks` - 5 endpoints):
- Individual occupational risks with Brazilian codes (e.g., "01.01.001")
- Type classification (PHYSICAL, CHEMICAL, BIOLOGICAL, ERGONOMIC, ACCIDENT)
- Intensity support (LOW, MEDIUM, HIGH, VERY_HIGH)
- Filtering by type, category, active status
- Soft delete functionality

**Environments** (`/api/v1/mapping/environments` - 8 endpoints):
- Work environments (GHE - Grupo Homogêneo de Exposição)
- Location types (EMPLOYER_ESTABLISHMENT, THIRD_PARTY_ESTABLISHMENT, MOBILE)
- eSocial integration fields (previousESocialCode, validityStart/End)
- Add/remove risks to/from environments with intensity levels
- Company-specific unique names

**Job Mapping** (`/api/v1/mapping/jobs` - 13 endpoints):
- Complete job-environment-risk mapping
- Main environment assignment for jobs
- Multiple environments per job
- Risk assignment with intensity and notes
- Exam protocols by job and exam type
- Job notes (function description, risk analysis, emergency procedures)
- Soft delete with active flag

**Key Features:**
- Unique constraints (companyId_name for environments, jobId_riskId for job risks)
- eSocial validation (requires code and validity when registered)
- Nested includes (risks with categories, environments with risks)
- Business logic validation (environment ownership, no duplicates)
- Seeded with realistic Brazilian occupational health data

**Legacy Data Layer (`services/dbService.ts`):**
- localStorage-based persistence (legacy)
- Still used for non-migrated entities (exames, documentos, PCMSO financial data)
- Will be gradually migrated to NestJS

### Component Structure

**Main App State (`App.tsx`):**
- Manages all modal states and data reloading
- Handles authentication/session state via `authApi`
- Calls `reloadData()` to fetch empresas and funcionarios from NestJS backend
- Routes between views: dashboard, empresas, funcionarios, financeiro, pcmso, relatorios, configuracoes

**Authentication (`components/auth/LoginPage.tsx`):**
- **Email-based login** (changed from username)
- Credentials: `admin@ocupalli.com.br` / `admin123`
- JWT tokens stored in sessionStorage

**Modals:** All user interactions happen through modals located in `components/modals/`:
- Modals for empresas and funcionarios use `apiService` for NestJS backend
- Other modals still use `dbService` for localStorage (pending migration)

---

## Authentication

**Backend JWT Authentication (NestJS):**
- Email + password login
- Passwords hashed with bcrypt (10 salt rounds)
- JWT access tokens (15min expiration)
- Refresh tokens (7 day expiration)
- Tokens stored in sessionStorage on frontend
- Middleware validates JWT and checks user role
- Default credentials (seeded):
  - Admin: `admin@ocupalli.com.br` / `admin123` (ADMIN)
  - Doctor: `joao.silva@ocupalli.com.br` / `doctor123` (DOCTOR)
  - Receptionist: `maria.recepcao@ocupalli.com.br` / `recepcao123` (RECEPTIONIST)
  - Technician: `carlos.tecnico@ocupalli.com.br` / `tecnico123` (TECHNICIAN)

**Frontend Session:**
- Managed by `authApi` in `apiService.ts`
- Session tokens stored in sessionStorage (keys: `accessToken`, `refreshToken`)
- `getCurrentUser()` fetches current user from `/api/v1/auth/me`
- `logout()` clears tokens and calls backend logout endpoint
- `refresh()` renews access token using refresh token

---

## Important Conventions

1. **API Backend:** ALWAYS use NestJS backend (`http://localhost:3000/api/v1`). The Express backend is deprecated.

2. **API vs localStorage:** When working with empresas or funcionarios, ALWAYS use `apiService` methods (e.g., `empresaApi.create()`, not `empresaService.add()`). For other entities not yet migrated, use `dbService`.

3. **Authentication:** Use **email** instead of username. All login forms should request email.

4. **IDs:** All IDs are strings (CUID), not numbers. When filtering or comparing IDs, use string equality.

5. **Field Names:** Use camelCase English names from NestJS:
   - `name` (not `nome`)
   - `corporateName` (not `razaoSocial`)
   - `tradeName` (not `nomeFantasia`)
   - `companyId` (not `empresaId`)
   - `active` (not `ativo`)

6. **HTTP Methods:** NestJS uses `PATCH` for updates (not `PUT`).

7. **Error Handling:** The `apiService` throws `ApiError` objects with `message` and optional `statusCode`. Components should catch these and display user-friendly messages.

---

## Database Schema (NestJS)

The Prisma schema defines 13 models including:

**Core Tables:**
- `users` - System users with role-based access (email-based auth)
- `companies` - Companies with CNPJ, delinquency tracking
- `workers` - Employees with CPF, birth date, gender
- `jobs` - Job positions with CBO codes
- `employments` - Employment relationships (worker + company + job)

**Medical:**
- `procedures` - Medical procedures catalog
- `appointments` - Appointments with status (WAITING, IN_SERVICE, etc.)
- `documents` - Medical documents (ASO, PCMSO) with finalization workflow

**Infrastructure:**
- `clinic_units` - Clinic locations
- `rooms` - Rooms within clinics
- `files` - File uploads
- `refresh_tokens` - JWT refresh tokens

All tables include timestamps (`createdAt`, `updatedAt`) and use CUID for IDs.

---

## Migration Status

**✅ Migrated to NestJS (100% functional):**
- Authentication (login, logout, refresh, me)
- Companies (CRUD + delinquency management)
- Workers (CRUD + CPF search + reactivation)

**⚠️ Pending Migration (still using localStorage):**
- Exames (medical exams)
- Documentos (documents)
- PCMSO configuration (cargos, ambientes, riscos, protocolos)
- Financial module (catálogo de serviços, cobranças, NFe)

**Stub APIs:** The `apiService.ts` includes stub implementations for non-migrated modules that return empty arrays or throw "API não migrada" errors. This ensures compatibility while modules are gradually migrated.

---

## Brazilian Context

This application is designed for Brazilian occupational health regulations:
- CBO (Classificação Brasileira de Ocupações) codes for job roles
- GHE (Grupo Homogêneo de Exposição) for work environments
- ASO (Atestado de Saúde Ocupacional) - occupational health certificates
- PCMSO (Programa de Controle Médico de Saúde Ocupacional) - mandatory health program
- CPF validation and formatting
- CNPJ validation for companies

All UI text and error messages are in Portuguese (Brazil).

---

## Path Aliases

The app uses `@/` as an alias for the project root:
```typescript
import { authApi } from '@/services/apiService';
```

---

## Testing

### Manual Testing via Swagger
Access `http://localhost:3000/api/docs` for interactive API testing.

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocupalli.com.br","password":"admin123"}'

# List companies (requires token)
curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Documentation Files

- **MIGRACAO-NESTJS.md** - Complete migration guide (Express → NestJS)
- **STATUS-ATUAL.md** - Current project status
- **nestjs-backend/SESSAO-ATUAL-RESUMO.md** - NestJS backend session summary
- **nestjs-backend/README.md** - NestJS backend documentation

---

## Troubleshooting

### Frontend can't connect to backend
- ✅ Verify NestJS backend is running on port 3000: `cd nestjs-backend && npm run dev`
- ✅ Check `.env.local` has `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- ✅ Verify CORS is configured for frontend port (3002) in `nestjs-backend/.env`

### Login fails with "Credenciais inválidas"
- ✅ Use **email** format: `admin@ocupalli.com.br` (not `admin`)
- ✅ Correct password: `admin123`
- ✅ Verify database was seeded: `cd nestjs-backend && npm run prisma:seed`

### TypeScript errors about IDs
- ✅ IDs are now `string` (CUID), not `number`
- ✅ Update any comparisons: `id === '123'` not `id === 123`

---

**Last Updated:** 30/11/2025
**Backend:** NestJS (port 3000)
**Frontend:** React + Vite (port 3002/3003)
**Status:** ✅ Migration to NestJS completed
