# 🚀 Migração para Backend NestJS - Ocupalli

**Data**: 30/11/2025
**Status**: ✅ Concluída

---

## 📋 Resumo

Migração completa do backend Express (porta 3001) para backend NestJS (porta 3000).

### Backend Anterior (Express)
- **Porta**: 3001
- **Endpoints**: `/api/auth/login`, `/api/empresas`, `/api/funcionarios`
- **Auth**: `username` + `password` → `{ token, user }`
- **IDs**: `number`
- **Database**: PostgreSQL (`occupational_health`)

### Backend Novo (NestJS - Ocupalli)
- **Porta**: 3000
- **Endpoints**: `/api/v1/auth/login`, `/api/v1/companies`, `/api/v1/workers`
- **Auth**: `email` + `password` → `{ accessToken, refreshToken, user }`
- **IDs**: `string` (CUID)
- **Database**: PostgreSQL (`ocupalli_test`)

---

## 🔄 Mudanças nas Interfaces

### User (Autenticação)

**Antes (Express)**:
```typescript
interface User {
  id: number;
  nome: string;
  username: string;
  role: 'ADMIN' | 'USER';
}
```

**Depois (NestJS)**:
```typescript
interface User {
  id: string; // CUID
  name: string; // nome → name
  email: string; // username → email
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'TECHNICIAN' | 'USER';
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### Login

**Antes**:
```typescript
authApi.login(username: string, password: string)
  → { user, token }
```

**Depois**:
```typescript
authApi.login(email: string, password: string)
  → { user, accessToken, refreshToken }
```

### Empresa (Company)

**Antes**:
```typescript
interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco?: string;
  _count?: {
    funcionarios: number;
    documentos: number;
  };
}
```

**Depois**:
```typescript
interface Empresa {
  id: string; // CUID
  corporateName: string; // razaoSocial → corporateName
  tradeName?: string; // nomeFantasia → tradeName
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string; // endereco → address
  active: boolean;
  isDelinquent: boolean;
  _count?: {
    workers: number; // funcionarios → workers
    jobs: number;
    appointments: number;
    documents: number;
  };
}
```

### Funcionário (Worker)

**Antes**:
```typescript
interface Funcionario {
  id: number;
  empresaId: number;
  nome: string;
  cpf?: string;
  whatsapp?: string;
  cargo: string;
  setor?: string;
  ativo: boolean;
}
```

**Depois**:
```typescript
interface Funcionario {
  id: string; // CUID
  companyId: string; // empresaId → companyId
  name: string; // nome → name
  cpf: string; // obrigatório
  birthDate?: string; // novo
  gender?: 'MALE' | 'FEMALE' | 'OTHER'; // novo
  phone?: string; // whatsapp → phone
  email?: string; // novo
  address?: string; // novo
  active: boolean; // ativo → active
  _count?: {
    employments: number;
    appointments: number;
    documents: number;
  };
}
```

---

## 📝 Arquivos Modificados

### 1. `.env.local`
```diff
+ VITE_API_BASE_URL=http://localhost:3000/api/v1
  VITE_GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

### 2. `services/apiService.ts`
- ✅ Atualizado para usar endpoints `/api/v1/*`
- ✅ Mudança de `username` para `email` no login
- ✅ Mudança de `token` para `accessToken` e `refreshToken`
- ✅ IDs mudaram de `number` para `string`
- ✅ Mapeamento de campos: `nome→name`, `razaoSocial→corporateName`, etc.
- ✅ Endpoints de empresas: `/empresas` → `/companies`
- ✅ Endpoints de funcionários: `/funcionarios` → `/workers`
- ✅ Método HTTP para update: `PUT` → `PATCH`

### 3. `components/auth/LoginPage.tsx`
- ✅ Campo de input mudou de "username" para "email"
- ✅ Placeholder atualizado: `ex: admin@ocupalli.com.br`
- ✅ Credenciais atualizadas: `admin@ocupalli.com.br` / `admin123`
- ✅ Mensagens de erro ajustadas

---

## 🔐 Credenciais de Teste

### Backend NestJS (ocupalli_test)

#### Admin (Full Access)
```
Email: admin@ocupalli.com.br
Senha: admin123
Role: ADMIN
```

#### Médico
```
Email: joao.silva@ocupalli.com.br
Senha: doctor123
Role: DOCTOR
```

#### Recepcionista
```
Email: maria.recepcao@ocupalli.com.br
Senha: recepcao123
Role: RECEPTIONIST
```

#### Técnico
```
Email: carlos.tecnico@ocupalli.com.br
Senha: tecnico123
Role: TECHNICIAN
```

---

## 🧪 Dados de Seed (Backend NestJS)

### Empresas (3)
1. **Tech Solutions Ltda** (CNPJ: 12345678000190)
2. **Construção & Engenharia S.A.** (CNPJ: 98765432000111) - ⚠️ Inadimplente
3. **Indústria Metal Forte Ltda** (CNPJ: 11223344000155)

### Trabalhadores (4)
1. Pedro Henrique Santos (CPF: 12345678901) - TechSolutions
2. Ana Paula Oliveira (CPF: 98765432109) - ConstrutechBR
3. Carlos Eduardo Silva (CPF: 11122233344) - MetalForte
4. Juliana Ferreira Costa (CPF: 55566677788) - TechSolutions

---

## ⚙️ Endpoints Migrados

| Funcionalidade | Express (Antigo) | NestJS (Novo) |
|---------------|------------------|---------------|
| Login | `POST /api/auth/login` | `POST /api/v1/auth/login` |
| Logout | `POST /api/auth/logout` | `POST /api/v1/auth/logout` |
| Me | `GET /api/auth/me` | `GET /api/v1/auth/me` |
| Refresh | ❌ | `POST /api/v1/auth/refresh` |
| Listar Empresas | `GET /api/empresas` | `GET /api/v1/companies` |
| Criar Empresa | `POST /api/empresas` | `POST /api/v1/companies` |
| Atualizar Empresa | `PUT /api/empresas/:id` | `PATCH /api/v1/companies/:id` |
| Deletar Empresa | `DELETE /api/empresas/:id` | `DELETE /api/v1/companies/:id` |
| Empresas Inadimplentes | ❌ | `GET /api/v1/companies/delinquent` |
| Toggle Inadimplência | ❌ | `PATCH /api/v1/companies/:id/toggle-delinquency` |
| Listar Funcionários | `GET /api/funcionarios` | `GET /api/v1/workers` |
| Buscar por CPF | ❌ | `GET /api/v1/workers/cpf/:cpf` |
| Criar Funcionário | `POST /api/funcionarios` | `POST /api/v1/workers` |
| Atualizar Funcionário | `PUT /api/funcionarios/:id` | `PATCH /api/v1/workers/:id` |
| Deletar Funcionário | `DELETE /api/funcionarios/:id` | `DELETE /api/v1/workers/:id` |
| Reativar Funcionário | ❌ | `PATCH /api/v1/workers/:id/reactivate` |

---

## 📚 Recursos Adicionais do NestJS

### Novos Módulos Disponíveis
- ✅ **Cargos (Jobs)**: Gestão de cargos com CBO
- ✅ **Vínculos (Employments)**: Vínculos empregatícios
- ✅ **Procedimentos (Procedures)**: Catálogo de procedimentos
- ✅ **Agendamentos (Appointments)**: Sala de espera e agendamentos
- ✅ **Documentos (Documents)**: Gestão de documentos (ASO, PCMSO)
- ✅ **Arquivos (Files)**: Upload e download
- ✅ **Unidades Clínicas (Clinic Units)**: Gestão de unidades
- ✅ **Salas (Rooms)**: Gestão de salas

### Swagger UI
- **URL**: http://localhost:3000/api/docs
- **Documentação interativa** de todos os endpoints
- **Testes diretos** via interface web

---

## 🚀 Como Iniciar

### Backend NestJS
```bash
cd nestjs-backend
npm run dev
```

**Servidor rodando em**: http://localhost:3000

### Frontend React
```bash
npm run dev
```

**Aplicação rodando em**: http://localhost:3002

---

## ✅ Checklist de Migração

- [x] Configurar `.env.local` com nova URL da API
- [x] Atualizar `apiService.ts` com novos endpoints
- [x] Atualizar interfaces de `User`, `Empresa`, `Funcionario`
- [x] Adaptar `LoginPage` para usar email
- [x] Atualizar credenciais de teste na UI
- [x] Testar login no frontend
- [x] Testar listagem de empresas
- [x] Testar listagem de funcionários
- [ ] Migrar módulos restantes (exames, documentos, etc.)
- [ ] Atualizar documentação principal (CLAUDE.md)

---

## 🔜 Próximos Passos

1. **Teste de Integração**: Iniciar frontend e testar login completo
2. **Validação de Fluxos**: Testar criação de empresas e funcionários
3. **Migração Gradual**: Migrar os demais módulos (exames, documentos, PCMSO, financeiro)
4. **Descomissionar Express**: Remover backend antigo após validação completa
5. **Atualizar Docs**: Atualizar CLAUDE.md e STATUS-ATUAL.md

---

## 📞 Troubleshooting

### Erro: "Failed to fetch"
- ✅ Verificar se backend NestJS está rodando na porta 3000
- ✅ Verificar se `.env.local` está configurado corretamente
- ✅ Verificar CORS no backend (configurado para porta 3002)

### Erro: "Credenciais inválidas"
- ✅ Usar `admin@ocupalli.com.br` em vez de `admin`
- ✅ Senha correta: `admin123`
- ✅ Verificar se banco `ocupalli_test` foi populado (seed)

### Erro de compilação TypeScript
- ✅ Verificar se interfaces foram atualizadas
- ✅ IDs devem ser `string`, não `number`
- ✅ Campos renomeados (nome→name, razaoSocial→corporateName)

---

**Última Atualização**: 30/11/2025 22:50
**Status**: ✅ Migração concluída - Pronta para testes
