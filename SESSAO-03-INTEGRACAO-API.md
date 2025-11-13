# 📋 Sessão 03 - Integração Frontend-Backend (API Service)

**Data:** 2025-11-10
**Tempo:** ~1h
**Status:** ✅ PARCIALMENTE COMPLETADO

---

## 🎯 Objetivo da Sessão

Criar a camada de integração entre frontend e backend, substituindo o localStorage por chamadas HTTP reais à API REST.

---

## ✅ O Que Foi Implementado

### 1. Criação do API Service (`services/apiService.ts`)

**Arquivo criado:** `services/apiService.ts` (370 linhas)

**Características:**
- ✅ Cliente HTTP usando **fetch nativo** (sem dependências externas)
- ✅ Gerenciamento automático de tokens JWT
- ✅ Tratamento de erros centralizado
- ✅ TypeScript com interfaces completas
- ✅ Suporte a todas as respostas da API

**Estrutura:**
```typescript
// Configuração base
const API_BASE_URL = 'http://localhost:3001/api';

// Funções utilitárias
- getToken()          // Obtém JWT do sessionStorage
- saveToken()         // Salva JWT no sessionStorage
- clearToken()        // Remove JWT
- fetchApi<T>()       // Wrapper do fetch com JWT e error handling

// APIs implementadas
- authApi             // Autenticação (login, logout, me)
- empresaApi          // CRUD de empresas
- funcionarioApi      // CRUD de funcionários
```

#### 1.1 API de Autenticação (`authApi`)

**Métodos implementados:**
```typescript
// Login no sistema
await authApi.login(username, password);
// Retorna: { user, token }

// Logout
await authApi.logout();

// Informações do usuário atual (via API)
await authApi.me();
// Retorna: User

// Usuário atual (do sessionStorage, sem API call)
authApi.getCurrentUser();
// Retorna: User | null

// Verifica se está autenticado
authApi.isAuthenticated();
// Retorna: boolean
```

**Gerenciamento de Token:**
- Token armazenado em `sessionStorage` (não persiste após fechar aba)
- Chave: `occupational_health_session`
- Formato: `{ token: string, user: User }`
- Enviado automaticamente em todas as requisições via header `Authorization: Bearer {token}`

#### 1.2 API de Empresas (`empresaApi`)

**Métodos implementados:**
```typescript
// Listar todas as empresas
await empresaApi.getAll();
// Retorna: Empresa[]

// Buscar por ID
await empresaApi.getById(id);
// Retorna: Empresa

// Criar empresa
await empresaApi.create(data);
// Retorna: Empresa

// Atualizar empresa
await empresaApi.update(id, data);
// Retorna: Empresa

// Deletar empresa (soft delete)
await empresaApi.delete(id);
// Retorna: void
```

**Interface Empresa:**
```typescript
interface Empresa {
  id: number;
  matrizId: number | null;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  medicoNome: string;
  medicoCrm: string;
  inicioValidade: string;     // ISO date
  revisarAte: string;          // ISO date
  diaPadraoVencimento?: number;
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime
  deletedAt?: string;          // ISO datetime
  _count?: {
    funcionarios: number;
    documentos: number;
  };
  filiais?: Empresa[];
}
```

#### 1.3 API de Funcionários (`funcionarioApi`)

**Métodos implementados:**
```typescript
// Listar todos (com filtros opcionais)
await funcionarioApi.getAll({ empresaId: 1, ativo: true });
// Retorna: Funcionario[]

// Buscar por ID
await funcionarioApi.getById(id);
// Retorna: Funcionario

// Criar funcionário
await funcionarioApi.create(data);
// Retorna: Funcionario

// Atualizar funcionário
await funcionarioApi.update(id, data);
// Retorna: Funcionario

// Deletar funcionário (soft delete)
await funcionarioApi.delete(id);
// Retorna: void
```

**Filtros suportados:**
```typescript
interface FuncionarioFilters {
  empresaId?: number;    // Filtra por empresa
  ativo?: boolean;       // Filtra por status ativo/inativo
}
```

**Interface Funcionario:**
```typescript
interface Funcionario {
  id: number;
  empresaId: number;
  nome: string;
  matricula?: string;
  cpf?: string;
  whatsapp?: string;
  cargo: string;
  setor?: string;
  dataAdmissao?: string;       // ISO date
  dataUltimoExame?: string;    // ISO date
  tipoUltimoExame?: string;
  ativo: boolean;
  createdAt: string;           // ISO datetime
  updatedAt: string;           // ISO datetime
  deletedAt?: string;          // ISO datetime
  exames?: any[];              // Incluído quando solicitado
}
```

### 2. Tratamento de Erros

**Classe ApiError:**
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

**Erros tratados:**
- ❌ Erros HTTP (400, 401, 403, 404, 500, etc.)
- ❌ Respostas inválidas (JSON malformado)
- ❌ Erros de rede (sem conexão)
- ❌ Timeout
- ❌ Erros da API (status: 'error')

**Exemplo de uso:**
```typescript
try {
  const empresas = await empresaApi.getAll();
  console.log(empresas);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 3. Correção do CORS no Backend

**Arquivo modificado:** `backend/.env`

**Antes:**
```env
FRONTEND_URL="http://localhost:3000"
```

**Depois:**
```env
FRONTEND_URL="http://localhost:3002"
```

**Impacto:**
- ✅ Backend agora aceita requisições do frontend na porta 3002
- ✅ CORS configurado corretamente
- ✅ Cookies e credentials permitidos

### 4. Reinicialização do Backend

**Ações realizadas:**
1. Matou processos antigos usando porta 3001 (PIDs: 6548, 16512)
2. Aguardou liberação da porta
3. Reiniciou backend com nova configuração
4. Verificou logs de inicialização

**Status:**
- ✅ Backend rodando na porta 3001
- ✅ CORS atualizado para porta 3002
- ✅ Servidor estável
- ✅ Health check funcionando

---

## 📁 Arquivos Criados/Modificados

### Arquivos Criados:
1. `services/apiService.ts` - Cliente HTTP completo (370 linhas)
2. `SESSAO-03-INTEGRACAO-API.md` - Este documento

### Arquivos Modificados:
1. `backend/.env` - FRONTEND_URL atualizada para porta 3002

---

## 🔧 Como Usar o API Service

### Exemplo 1: Login
```typescript
import { authApi } from './services/apiService';

async function fazerLogin() {
  try {
    const { user, token } = await authApi.login('admin', 'admin');
    console.log('Usuário logado:', user);
    console.log('Token:', token);
    // Token é salvo automaticamente no sessionStorage
  } catch (error) {
    console.error('Erro no login:', error);
  }
}
```

### Exemplo 2: Listar Empresas
```typescript
import { empresaApi } from './services/apiService';

async function listarEmpresas() {
  try {
    const empresas = await empresaApi.getAll();
    console.log('Empresas:', empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
  }
}
```

### Exemplo 3: Criar Funcionário
```typescript
import { funcionarioApi } from './services/apiService';

async function criarFuncionario() {
  try {
    const novoFuncionario = await funcionarioApi.create({
      empresaId: 1,
      nome: 'João Silva',
      cpf: '12345678900',
      cargo: 'Desenvolvedor',
      ativo: true
    });
    console.log('Funcionário criado:', novoFuncionario);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
  }
}
```

### Exemplo 4: Tratamento de Erros Completo
```typescript
import { empresaApi, ApiError } from './services/apiService';

async function buscarEmpresa(id: number) {
  try {
    const empresa = await empresaApi.getById(id);
    return empresa;
  } catch (error) {
    if (error instanceof ApiError) {
      // Erro da API
      if (error.statusCode === 401) {
        console.error('Não autenticado. Faça login novamente.');
        // Redirecionar para login
      } else if (error.statusCode === 404) {
        console.error('Empresa não encontrada.');
      } else if (error.statusCode === 403) {
        console.error('Sem permissão.');
      } else {
        console.error('Erro:', error.message);
      }
    } else {
      // Erro desconhecido
      console.error('Erro inesperado:', error);
    }
    throw error;
  }
}
```

---

## ⚠️ Observações Importantes

### 1. SessionStorage vs LocalStorage

**Decisão tomada:** Usar `sessionStorage` para o token

**Por quê?**
- ✅ Mais seguro: token não persiste após fechar a aba
- ✅ Reduz risco de XSS
- ✅ Usuário precisa fazer login a cada sessão (mais seguro)

**Alternativa:** Se quiser manter login por mais tempo, mudar para `localStorage`:
```typescript
// Em apiService.ts, substituir sessionStorage por localStorage
localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
```

### 2. Fetch Nativo vs Axios

**Decisão tomada:** Usar `fetch` nativo

**Vantagens:**
- ✅ Sem dependências externas
- ✅ Suportado nativamente por todos os browsers modernos
- ✅ Menor tamanho do bundle
- ✅ API padronizada do JavaScript

**Desvantagens:**
- ❌ Não cancela requisições automaticamente
- ❌ Não tem interceptors nativos (implementamos manualmente)
- ❌ Não transforma JSON automaticamente (implementamos)

**Se quiser usar Axios:**
```bash
npm install axios
```
E refatorar `apiService.ts` para usar axios.

### 3. Integração Ainda NÃO Completa

**Status atual:**
- ✅ API Service criado e funcional
- ✅ Todas as interfaces TypeScript definidas
- ✅ Tratamento de erros implementado
- ✅ CORS configurado
- ⚠️ **Frontend ainda NÃO usa o API Service**

**O que falta:**
1. Modificar `LoginPage.tsx` para usar `authApi.login()`
2. Modificar `App.tsx` para usar `authApi.getCurrentUser()`
3. Modificar componentes para usar `empresaApi` e `funcionarioApi`
4. Remover ou deprecar `dbService.ts` (localStorage)
5. Adicionar loading states
6. Adicionar toast/notificações para erros

### 4. Próximos Passos Críticos

Para completar a integração:

**Passo 1:** Modificar LoginPage
```typescript
// Em LoginPage.tsx
import { authApi } from './services/apiService';

async function handleLogin() {
  try {
    const { user } = await authApi.login(username, password);
    // Redirecionar para dashboard
  } catch (error) {
    // Mostrar erro
  }
}
```

**Passo 2:** Modificar App.tsx
```typescript
// Em App.tsx
import { authApi } from './services/apiService';

useEffect(() => {
  const user = authApi.getCurrentUser();
  if (!user) {
    // Redirecionar para login
  }
}, []);
```

**Passo 3:** Modificar EmpresasTab
```typescript
// Em EmpresasTab.tsx
import { empresaApi } from './services/apiService';

useEffect(() => {
  async function carregarEmpresas() {
    const empresas = await empresaApi.getAll();
    setEmpresas(empresas);
  }
  carregarEmpresas();
}, []);
```

---

## 🧪 Como Testar Agora

### Teste 1: Verificar Backend está Rodando
```bash
curl http://localhost:3001/api/health
```
Deve retornar:
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "..."
}
```

### Teste 2: Testar Login via Console do Browser
1. Abrir http://localhost:3002
2. Abrir DevTools (F12)
3. No Console, executar:
```javascript
// Importar o apiService
const { authApi } = await import('./services/apiService.ts');

// Fazer login
const result = await authApi.login('admin', 'admin');
console.log('Login bem-sucedido:', result);

// Verificar se está autenticado
console.log('Autenticado:', authApi.isAuthenticated());

// Ver usuário atual
console.log('Usuário:', authApi.getCurrentUser());
```

### Teste 3: Testar Empresas via Console
```javascript
// Importar
const { empresaApi } = await import('./services/apiService.ts');

// Listar empresas (banco está vazio)
const empresas = await empresaApi.getAll();
console.log('Empresas:', empresas); // []

// Criar empresa
const novaEmpresa = await empresaApi.create({
  razaoSocial: 'Empresa Teste LTDA',
  nomeFantasia: 'Teste',
  cnpj: '12345678000190',
  medicoNome: 'Dr. Teste',
  medicoCrm: '12345',
  inicioValidade: '2025-01-01',
  revisarAte: '2026-01-01'
});
console.log('Empresa criada:', novaEmpresa);

// Listar novamente
const empresasAtualizadas = await empresaApi.getAll();
console.log('Empresas atualizadas:', empresasAtualizadas);
```

### Teste 4: Verificar CORS
```javascript
// No console do browser (F12), executar:
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```
Se funcionar, CORS está OK.

---

## 📊 Estatísticas

- **Arquivos criados:** 2
- **Linhas de código:** ~370 (apiService.ts)
- **Interfaces TypeScript:** 6
- **APIs implementadas:** 3 (auth, empresas, funcionários)
- **Métodos de API:** 13
- **Tempo de desenvolvimento:** ~1h

---

## 🎯 Próxima Sessão (04): Integração Completa

### Objetivos:
1. **Modificar LoginPage para usar authApi**
   - Remover chamada ao dbService
   - Usar authApi.login()
   - Adicionar loading state
   - Tratar erros de forma amigável

2. **Modificar App.tsx**
   - Verificar autenticação via authApi
   - Carregar dados da API em vez de localStorage
   - Implementar loading global

3. **Modificar EmpresasTab**
   - Usar empresaApi em vez de empresaService
   - Implementar CRUD completo via API
   - Adicionar loading states

4. **Modificar FuncionariosTab**
   - Usar funcionarioApi
   - Filtros via API
   - Loading states

5. **Criar componentes de UI**
   - Loading Spinner global
   - Toast para notificações
   - Error boundary

6. **Deprecar dbService**
   - Marcar como deprecated
   - Migrar todos os componentes
   - Eventualmente remover

---

## 🔐 Segurança

### Implementado:
- ✅ Tokens JWT enviados via header Authorization
- ✅ Tokens não expostos em URLs
- ✅ sessionStorage (mais seguro que localStorage)
- ✅ CORS configurado
- ✅ HTTPS em produção (configurar no deploy)

### Ainda precisa:
- ⚠️ Implementar refresh token
- ⚠️ Rotação de tokens
- ⚠️ Rate limiting no frontend
- ⚠️ Validação de inputs
- ⚠️ Sanitização de dados
- ⚠️ Content Security Policy

---

## 📝 Conclusão

A Sessão 03 estabeleceu a **base da integração** entre frontend e backend:

**Completado:**
- ✅ API Service completo e funcional
- ✅ TypeScript com tipos corretos
- ✅ Tratamento de erros robusto
- ✅ CORS corrigido
- ✅ Backend configurado

**Pendente:**
- ⚠️ Modificar componentes do frontend para usar API
- ⚠️ Adicionar loading states
- ⚠️ Implementar toast notifications
- ⚠️ Remover dependência do localStorage

**Progresso geral:** ~30% do projeto completo

**Status:** Pronto para Sessão 04 - Integração dos Componentes

---

**Última atualização:** 2025-11-10 22:30
**Próxima sessão:** Modificar componentes do frontend para usar apiService
