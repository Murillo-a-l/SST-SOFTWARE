# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Occupational Health Management System** built as a React-based single-page application for managing employee occupational health data, medical exams, documents, and billing in Brazil. The application is designed for companies to track employee health compliance (ASOs, PCMSO), manage contracts, and handle financial operations related to occupational health services.

**Key Characteristics:**
- Frontend-only application with no backend (currently)
- All data persists in browser `localStorage`
- Multi-company architecture with matriz/filial (parent/subsidiary) relationships
- Built with React 19, TypeScript, and Vite
- Integrates with Google Gemini AI for occupational health assistance
- Tailwind CSS for styling (inferred from component structure)

## Build and Development Commands

```bash
# Install dependencies
npm install

# Run development server
# Server runs on http://localhost:3000 (configured in vite.config.ts)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Dev Server Configuration:**
- Port: 3000
- Host: 0.0.0.0 (accessible from network)
- Hot Module Replacement (HMR) enabled via Vite

## Environment Configuration

Create a `.env.local` file in the project root with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:**
- Get your API key from https://ai.google.dev/
- The application will display an error alert if the Gemini API key is missing when AI features are used
- Error message: "Chave da API ausente. Configure VITE_GEMINI_API_KEY."
- The key is exposed in the browser via `import.meta.env` and `vite.config.ts` define statements

## Architecture

### Data Persistence Layer (`services/dbService.ts`)

The entire application state is managed through a localStorage-based database service. This is NOT a real backend - it's a client-side persistence layer.

**Key Functions:**
- `loadDb()`: Loads data from localStorage
- `saveDb(db)`: Saves data to localStorage
- `initializeDb()`: Initializes DB and runs migrations
- `getInitialDb()`: Returns default/empty database structure

**CRUD Services:**
The file exports CRUD services for all entities (e.g., `funcionarioService`, `empresaService`, `documentoService`). These services provide `add()`, `update()`, `remove()`, `getAll()`, `getById()` methods.

**Important DB Functions:**
- `detectarDuplicados()`: Detects duplicate employees by CPF or similar names
- `mesclarFuncionarios()`: Merges duplicate employee records
- `limparExamesOrfaos()`: Removes orphaned exam records
- `updateAllDocumentStatuses()`: Updates document statuses based on expiration dates (acts as a "cron job")
- `getCurrentUser()` / `logout()`: Simple session management

### Type System (`types.ts`)

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
- Handles authentication/session state
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

## Data Migration

The app includes a migration system in `dbService.ts`:
- `runMigration()`: Automatically migrates from single-company to multi-company schema
- Creates a default company from legacy `pcmsoConfig` if `empresas` array is empty
- Associates all existing employees with the default company
- This runs automatically on `initializeDb()`

## Authentication

**INSECURE - Demo purposes only:**
- User passwords stored in plaintext in localStorage
- Default credentials: `admin` / `admin` and `joao.medico` / `123`
- Session managed via `SESSION_KEY` in localStorage
- Login handled by `LoginPage` component

**In production, this MUST be replaced with:**
- Proper backend authentication
- Password hashing
- Secure session management

## Important Conventions

1. **Company Filtering:** Many views filter data by `selectedEmpresaId`. When a matriz is selected, data includes both the matriz and all its filiais via `getCompanyIdsForFilter()`.

2. **Modal Pattern:** Opening modals for quick-add scenarios:
   - Parent modal can call `onOpenEmpresaManager("Company Name")` to create a company on-the-fly
   - The new modal receives `initialName` prop and pre-populates the name field
   - After save, control returns to parent modal with `reloadData()` called

3. **Document Status Updates:** The app calls `updateAllDocumentStatuses()` on init, which acts as a cron job to update document statuses based on current date vs. expiration dates.

4. **Notification System:** Notifications are generated dynamically in `App.tsx` based on:
   - Duplicate employees detected
   - Pending document signatures for current user

5. **Confirmation Modal:** Destructive actions (deactivate, delete, reactivate) use `ConfirmationModal` with customizable messages and confirmation text requirements.

6. **Data Reload Pattern:** After any data modification, call `reloadData()` to refresh `data` state from localStorage. This triggers recalculation of stats, notifications, and filtered data.

## Path Aliases

The app uses `@/` as an alias for the project root:
```typescript
import { dbService } from '@/services/dbService';
```

## Backend Status

The `backend/` directory exists but is empty (contains only an empty `package.json`). All references to `backend/src/server.ts` in documentation are placeholders. The application currently has no backend implementation.

## Brazilian Context

This application is designed for Brazilian occupational health regulations:
- CBO (Classificação Brasileira de Ocupações) codes for job roles
- GHE (Grupo Homogêneo de Exposição) for work environments
- ASO (Atestado de Saúde Ocupacional) - occupational health certificates
- PCMSO (Programa de Controle Médico de Saúde Ocupacional) - mandatory health program
- PGR (Programa de Gerenciamento de Riscos) - risk management program
- NFe (Nota Fiscal Eletrônica) - electronic tax invoice
- LC 116 service codes and ISS (Imposto Sobre Serviços) tax rates

All UI text and error messages are in Portuguese (Brazil).
