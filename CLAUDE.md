# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Occupational Health Management System** built as a full-stack application for managing employee occupational health data, medical exams, documents, and billing in Brazil. The application is designed for companies to track employee health compliance (ASOs, PCMSO), manage contracts, and handle financial operations related to occupational health services.

**Key Characteristics:**
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (port 3002)
- **Backend**: Node.js + Express + TypeScript + Prisma ORM (port 3001)
- **Database**: PostgreSQL 18
- **Hybrid architecture**: Currently migrating from localStorage to PostgreSQL (90% complete)
- Multi-company architecture with matriz/filial (parent/subsidiary) relationships
- Integrates with Google Gemini AI for occupational health assistance
- NFS-e (Brazilian tax invoice) integration via IPM/AtendeNet webservice

## Build and Development Commands

### Frontend

```bash
# Install dependencies
npm install

# Run development server (runs on http://localhost:3002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Dev Server Configuration:**
- Port: 3002 (changed from 3000)
- Host: 0.0.0.0 (accessible from network)
- Hot Module Replacement (HMR) enabled via Vite

### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup database (first time only)
# 1. Create PostgreSQL database: CREATE DATABASE occupational_health;
# 2. Copy .env.example to .env and configure DATABASE_URL
# 3. IMPORTANT: Merge schema-extra.prisma into schema.prisma (see note below)
# 4. Run migrations
npm run prisma:generate
npm run prisma:migrate

# Seed database with initial data (admin user, document types)
npm run prisma:seed

# Run development server with hot reload (runs on http://localhost:3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI on http://localhost:5555)
npm run prisma:studio
```

**Important Prisma Note:**
The Prisma schema is split into two files: `backend/prisma/schema.prisma` (partial) and `backend/prisma/schema-extra.prisma` (rest). Before running migrations, you must copy the contents of `schema-extra.prisma` and append it to the end of `schema.prisma`.

## Environment Configuration

### Frontend (.env.local in project root)

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:**
- Get your API key from https://ai.google.dev/
- The application will display an error alert if the Gemini API key is missing when AI features are used
- The key is exposed in the browser via `import.meta.env`

### Backend (backend/.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/occupational_health?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3002"

# Gemini API (optional - for AI features)
GEMINI_API_KEY="your-gemini-api-key"

# NFS-e (optional - for Brazilian tax invoices)
NFSE_IPM_LOGIN="your-cnpj"
NFSE_IPM_SENHA="your-password"
NFSE_IPM_CIDADE="8055"
NFSE_IPM_MODO_TESTE="true"
```

See `backend/.env.example` for a template.

## Architecture

### Hybrid Data Persistence (Migration in Progress)

The application is currently in a **hybrid state**, transitioning from localStorage to PostgreSQL:

**Using Backend API (✅ Complete):**
- Authentication (login, logout, session management)
- Empresas (companies) - full CRUD
- Funcionarios (employees) - full CRUD

**Still Using localStorage (⚠️ Pending migration):**
- ExameRealizado (medical exam records)
- DocumentoEmpresa (company documents)
- PCMSO configuration (cargos, ambientes, riscos, protocolos)
- Financial module (catálogo de serviços, cobranças, NFe)

**Data Flow:**
1. Frontend calls `services/apiService.ts` for API operations
2. API service wraps `backend/src/` Express endpoints
3. Backend uses Prisma ORM to interact with PostgreSQL
4. For non-migrated features, frontend falls back to `services/dbService.ts` (localStorage)

### Backend Structure (`backend/`)

**Server (`src/server.ts`):**
- Express app with CORS, Helmet, error handling
- Runs on port 3001
- Graceful shutdown support

**Routes (`src/routes/`):**
- `auth.routes.ts` - Authentication (login, logout, me)
- `empresa.routes.ts` - Company CRUD
- `funcionario.routes.ts` - Employee CRUD
- `exame.routes.ts` - Exam records
- `documento.routes.ts` - Documents
- `pasta.routes.ts` - Folder hierarchy
- `documentoTipo.routes.ts` - Document types
- `catalogoServico.routes.ts` - Service catalog
- `servicoPrestado.routes.ts` - Rendered services
- `cobranca.routes.ts` - Billing
- `nfe.routes.ts` - Tax invoices
- `configuracaoNFSe.routes.ts` - NFS-e configuration

**Controllers (`src/controllers/`):**
- Handle request/response logic
- Call Prisma for database operations
- Return standardized JSON responses

**Middleware (`src/middleware/`):**
- `auth.ts` - JWT authentication and role-based authorization
- `errorHandler.ts` - Centralized error handling

**Services (`src/services/nfse/`):**
- `ipmWebserviceClient.ts` - SOAP client for IPM/AtendeNet
- `ipmXmlGenerator.ts` - Generates XML for NFS-e emission
- `ipmXmlParser.ts` - Parses XML responses
- `types.ts` - NFS-e type definitions

**Database (`src/config/database.ts` + `prisma/`):**
- Prisma client configuration
- Schema with 18 tables
- Soft deletes on all main tables
- Seed script creates admin user and default document types

### Frontend Structure

**API Service Layer (`services/apiService.ts`):**
- Wrapper around backend REST API
- Uses native fetch (no axios)
- JWT token management via sessionStorage
- Exports: `authApi`, `empresaApi`, `funcionarioApi`
- Error handling with typed `ApiError` class

**Legacy Data Layer (`services/dbService.ts`):**
- localStorage-based persistence (legacy)
- Still used for non-migrated entities
- Exports CRUD services for all types
- Includes migration utilities and data validation

**Type System (`types.ts`):**
All TypeScript interfaces are centralized in `types.ts`. Key types:

**Core Entities:**
- `Empresa`: Companies with matriz/filial relationships, PCMSO config, and billing settings
- `Funcionario`: Employees linked to companies via `empresaId`
- `ExameRealizado`: Medical exam records for employees
- `DocumentoEmpresa`: Company documents (contracts, ASOs, PCMSO, etc.) with expiration tracking and signature workflow
- `User`: System users with role-based access (admin/user)

**PCMSO Management:**
- `Cargo`: Job roles with CBO codes
- `Ambiente`: Work environments (GHE)
- `Risco`: Occupational risks (physical, chemical, biological, ergonomic, accidents)
- `MasterExame`: Catalog of medical exams
- `ProtocoloExame`: Links exams to job roles for different exam types (admissional, periodic, etc.)
- `PeriodicidadeCargo`: Defines exam periodicity for each job role

**Financial Module:**
- `CatalogoServico`: Service catalog with pricing
- `ServicoPrestado`: Rendered services linked to companies/employees
- `Cobranca`: Billing records
- `NFe`: Tax invoices (Nota Fiscal Eletrônica)

**Document Management:**
- `Pasta`: Folder hierarchy for organizing documents
- `DocumentoTipo`: Document type definitions with default validity periods
- `DocumentoStatus`: 'ATIVO' | 'VENCENDO' | 'VENCIDO' | 'ENCERRADO'
- `SignatureStatus`: 'Nao Requer' | 'Pendente' | 'Assinado' | 'Rejeitado'

### Component Structure

The application follows a view-based architecture:

**Main App State (`App.tsx`):**
- Manages all modal states and data reloading
- Handles authentication/session state via `authApi`
- Calls `reloadData()` to fetch empresas and funcionarios from backend API
- Filters data based on selected company (matriz + filiais)
- Generates notifications for duplicates and pending signatures
- Routes between views: dashboard, empresas, funcionarios, financeiro, pcmso, relatorios, configuracoes

**Views:**
- `Dashboard`: Overview with stats cards and alerts
- `EmpresasTab`: Multi-company management with folder-based document organization
- `FuncionariosTab` / `DesativadosTab` / `ValidacaoTab`: Employee management with three sub-tabs
- `FinanceiroGeralTab`: Financial module for services, billing, and invoicing
- `PcmsoTab`: PCMSO configuration (jobs, risks, environments, exam protocols)
- `RelatoriosTab`: Report generation
- `ConfiguracoesGeraisTab`: System configuration

**Modals:** All user interactions happen through modals located in `components/modals/`. Key patterns:
- Manager modals handle creation/editing (e.g., `EmpresaManagerModal`, `DocumentoManagerModal`)
- Modals for empresas and funcionarios use `apiService` for backend persistence
- Other modals still use `dbService` for localStorage
- The app uses `initialName` props to pre-populate modals when creating related entities on-the-fly
- All modals call `onSaveSuccess` / `onDataChange` callbacks to trigger data reload

**Common Components:**
- `Header`: Company selector, notifications, user menu
- `Sidebar`: Navigation between views
- `SearchableSelect`: Reusable searchable dropdown component

### Gemini AI Integration (`src/services/geminiService.ts`)

The app integrates Google's Gemini AI (using `gemini-1.5-flash` model) for:
- `summarizeText(text)`: Summarizes text for occupational medicine context
- `suggestExams(employee)`: Suggests medical exams based on employee job role and risks

**Implementation Details:**
- Uses `@google/generative-ai` package
- Model instance is cached after first initialization
- API key loaded from `import.meta.env.VITE_GEMINI_API_KEY`
- `useGemini` hook (`src/hooks/useGemini.ts`) provides React integration

**Error Handling:** All Gemini functions throw `GeminiError` objects with a `message` property. The app checks for API key presence via `assertApiKey()` before making requests.

## Authentication

**Backend JWT Authentication:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens issued on login (7 day expiration by default)
- Tokens stored in sessionStorage on frontend
- Middleware validates JWT and checks user role for protected routes
- Default credentials (seeded by `prisma:seed`):
  - Admin: `admin` / `admin`
  - User: `joao.medico` / `123`

**Frontend Session:**
- Managed by `authApi` in `apiService.ts`
- Session token stored in sessionStorage (key: `token`)
- `getCurrentUser()` fetches current user from `/api/auth/me`
- `logout()` clears token and calls backend logout endpoint

## Important Conventions

1. **API vs localStorage:** When working with empresas or funcionarios, ALWAYS use `apiService` methods (e.g., `empresaApi.create()`, not `empresaService.add()`). For other entities not yet migrated, use `dbService`.

2. **Company Filtering:** Many views filter data by `selectedEmpresaId`. When a matriz is selected, data includes both the matriz and all its filiais via `getCompanyIdsForFilter()`.

3. **Modal Pattern:** Opening modals for quick-add scenarios:
   - Parent modal can call `onOpenEmpresaManager("Company Name")` to create a company on-the-fly
   - The new modal receives `initialName` prop and pre-populates the name field
   - After save, control returns to parent modal with `reloadData()` called

4. **Document Status Updates:** The app calls `updateAllDocumentStatuses()` on init (localStorage only), which acts as a cron job to update document statuses based on current date vs. expiration dates.

5. **Notification System:** Notifications are generated dynamically in `App.tsx` based on:
   - Duplicate employees detected
   - Pending document signatures for current user

6. **Confirmation Modal:** Destructive actions (deactivate, delete, reactivate) use `ConfirmationModal` with customizable messages and confirmation text requirements.

7. **Data Reload Pattern:** After any data modification, call `reloadData()` to refresh state. This is now async and fetches empresas and funcionarios from the backend API via `Promise.all()`.

8. **Error Handling:** The `apiService` throws `ApiError` objects with `message` and optional `statusCode`. Components should catch these and display user-friendly messages (currently using `alert()`, but `react-hot-toast` is installed for future migration).

## Path Aliases

The app uses `@/` as an alias for the project root:
```typescript
import { dbService } from '@/services/dbService';
import { empresaApi } from '@/services/apiService';
```

## Database Schema

The Prisma schema defines 18 tables including:

**Core Tables:**
- `users` - System users with role-based access
- `empresas` - Companies with matriz/filial relationships
- `funcionarios` - Employees linked to companies
- `exames_realizados` - Medical exam records

**Document Management:**
- `pastas` - Folder hierarchy
- `documento_tipos` - Document type definitions
- `documentos_empresa` - Company documents with expiration and signatures

**PCMSO:**
- `cargos` - Job roles
- `ambientes` - Work environments
- `riscos` - Occupational risks
- `master_exames` - Exam catalog
- `protocolos_exame` - Exam protocols by job role
- `periodicidade_cargos` - Exam periodicity rules

**Financial:**
- `catalogo_servicos` - Service catalog
- `servicos_prestados` - Rendered services
- `cobrancas` - Billing records
- `nfes` - Tax invoices

All tables include soft delete (`deletedAt`) and timestamps (`createdAt`, `updatedAt`).

## Brazilian Context

This application is designed for Brazilian occupational health regulations:
- CBO (Classificação Brasileira de Ocupações) codes for job roles
- GHE (Grupo Homogêneo de Exposição) for work environments
- ASO (Atestado de Saúde Ocupacional) - occupational health certificates
- PCMSO (Programa de Controle Médico de Saúde Ocupacional) - mandatory health program
- PGR (Programa de Gerenciamento de Riscos) - risk management program
- NFe (Nota Fiscal Eletrônica) - electronic tax invoice via IPM/AtendeNet webservice
- LC 116 service codes and ISS (Imposto Sobre Serviços) tax rates

All UI text and error messages are in Portuguese (Brazil).

## Migration Status

**What's Completed (90%):**
- ✅ Backend API fully functional
- ✅ PostgreSQL database with 18 tables
- ✅ Authentication integrated (JWT + bcrypt)
- ✅ Empresas CRUD via API
- ✅ Funcionarios CRUD via API
- ✅ Frontend loads empresas and funcionarios from API

**What's Pending (10%):**
- ⚠️ Exames still use localStorage
- ⚠️ Documents still use localStorage
- ⚠️ PCMSO configuration still uses localStorage
- ⚠️ Financial module still uses localStorage
- ⚠️ Replace `alert()` with `react-hot-toast` notifications
- ⚠️ Add loading spinners (state exists but no UI)

See `STATUS-ATUAL.md` for detailed current status and `CHECKLIST-IMPLEMENTACAO.md` for complete task list.

## Session Documentation

The project has detailed session logs documenting the implementation:
- `SESSAO-01-IMPLEMENTADO.md` - Backend initial implementation
- `SESSAO-02-TESTES-E-CORRECOES.md` - Tests and corrections
- `SESSAO-03-INTEGRACAO-API.md` - API service creation
- `SESSAO-04-INTEGRACAO-COMPONENTES.md` - Component integration with API
- `SESSAO-05-CARREGAMENTO-API.md` - Data loading refactor
- `SESSAO-06-*.md` - Employee modal integration

Always check `STATUS-ATUAL.md` first for the current state of the system.
