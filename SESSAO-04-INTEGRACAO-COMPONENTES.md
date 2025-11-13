# 📋 Sessão 04 - Integração dos Componentes com API

**Data:** 2025-11-11
**Tempo:** ~1h
**Status:** ✅ PARCIALMENTE COMPLETADO

---

## 🎯 Objetivo da Sessão

Integrar os componentes do frontend com o apiService criado na Sessão 03, substituindo chamadas ao dbService (localStorage) por chamadas HTTP reais à API REST.

---

## ✅ O Que Foi Implementado

### 1. Modificação do LoginPage (`components/auth/LoginPage.tsx`)

**Arquivo modificado:** `components/auth/LoginPage.tsx`

**Mudanças:**
- ✅ Removido import de `dbService`
- ✅ Adicionado import de `authApi` e `ApiError`
- ✅ Função `handleLogin` convertida para async/await
- ✅ Removido `setTimeout` simulado - agora usa chamada HTTP real
- ✅ Tratamento de erros específico por código HTTP (401, 500, etc.)
- ✅ Loading state já existia - mantido funcional

**Antes:**
```typescript
import * as dbService from '../../services/dbService';

const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        const user = dbService.login(username, password);
        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Usuário ou senha inválidos.');
        }
        setIsLoading(false);
    }, 500);
};
```

**Depois:**
```typescript
import { authApi, ApiError } from '../../services/apiService';

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const { user } = await authApi.login(username, password);
        onLoginSuccess(user);
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.statusCode === 401) {
                setError('Usuário ou senha inválidos.');
            } else if (err.statusCode === 500) {
                setError('Erro no servidor. Tente novamente mais tarde.');
            } else {
                setError(err.message || 'Erro ao fazer login.');
            }
        } else {
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        }
    } finally {
        setIsLoading(false);
    }
};
```

**Benefícios:**
- Login agora comunica com backend real
- Token JWT salvo automaticamente no sessionStorage
- Mensagens de erro mais específicas
- Tratamento adequado de erros de rede

---

### 2. Modificação do App.tsx

**Arquivo modificado:** `App.tsx`

**Mudanças:**
- ✅ Adicionado import de `authApi`
- ✅ `getCurrentUser()` agora usa `authApi.getCurrentUser()` (lê do sessionStorage)
- ✅ `handleLogout()` convertido para async e usa `authApi.logout()`
- ✅ Continua com logout local mesmo se falhar no servidor

**Antes:**
```typescript
import * as dbService from './services/dbService';

useEffect(() => {
    // ...
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
    // ...
}, []);

const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
};
```

**Depois:**
```typescript
import * as dbService from './services/dbService';
import { authApi } from './services/apiService';

useEffect(() => {
    // ...
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
    // ...
}, []);

const handleLogout = async () => {
    try {
        await authApi.logout();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Continua com logout local mesmo se falhar no servidor
    } finally {
        setCurrentUser(null);
    }
};
```

**Notas:**
- `dbService` ainda é importado para outras funcionalidades (loadDb, initializeDb, etc.)
- A migração completa exigirá substituir todas as chamadas ao dbService
- Por enquanto, apenas autenticação usa a API

---

### 3. Modificação do EmpresaManagerModal

**Arquivo modificado:** `components/modals/EmpresaManagerModal.tsx`

**Mudanças:**
- ✅ Removido import de `empresaService` do dbService
- ✅ Adicionado import de `empresaApi` e `ApiError`
- ✅ Adicionado estado `isSaving` para controle de loading
- ✅ Função `handleSave` convertida para async/await
- ✅ Mapeamento de campos do formulário para formato da API
- ✅ Tratamento de erros com try/catch
- ✅ Validação adicional de campos obrigatórios
- ✅ Botão "Salvar" mostra "Salvando..." durante a requisição
- ✅ Botões desabilitados durante salvamento

**Antes:**
```typescript
import { empresaService } from '../../services/dbService';

const handleSave = () => {
    if (!formData.razaoSocial || !formData.nomeFantasia || !formData.cnpj) {
        alert("Razão Social, Nome Fantasia e CNPJ são obrigatórios.");
        return;
    }

    const dataToSave = { ...formData, ... };

    if (empresa) {
        empresaService.update(empresa.id, dataToSave);
        alert(`Empresa "${formData.nomeFantasia}" atualizada com sucesso!`);
    } else {
        empresaService.add(dataToSave);
        alert(`Empresa "${formData.nomeFantasia}" cadastrada com sucesso!`);
    }

    onSaveSuccess();
    onClose();
};
```

**Depois:**
```typescript
import { empresaApi, ApiError } from '../../services/apiService';

const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
    if (!formData.razaoSocial || !formData.nomeFantasia || !formData.cnpj) {
        alert("Razão Social, Nome Fantasia e CNPJ são obrigatórios.");
        return;
    }

    if (!formData.medico_nome || !formData.medico_crm ||
        !formData.inicio_validade || !formData.revisar_ate) {
        alert("Médico, CRM, Início de Validade e Revisar Até são obrigatórios.");
        return;
    }

    setIsSaving(true);

    try {
        // Mapear campos do formulário para o formato da API
        const dataToSave = {
            matrizId: formData.matrizId,
            razaoSocial: formData.razaoSocial,
            nomeFantasia: formData.nomeFantasia,
            cnpj: formData.cnpj,
            endereco: formData.endereco || undefined,
            contatoNome: formData.contatoNome || undefined,
            contatoEmail: formData.contatoEmail || undefined,
            contatoTelefone: formData.contatoTelefone || undefined,
            medicoNome: formData.medico_nome,        // Mapeamento!
            medicoCrm: formData.medico_crm,          // Mapeamento!
            inicioValidade: formData.inicio_validade, // Mapeamento!
            revisarAte: formData.revisar_ate,        // Mapeamento!
            diaPadraoVencimento: formData.diaPadraoVencimento ?
                Number(formData.diaPadraoVencimento) : undefined,
        };

        if (empresa) {
            await empresaApi.update(empresa.id, dataToSave);
            alert(`Empresa "${formData.nomeFantasia}" atualizada com sucesso!`);
        } else {
            await empresaApi.create(dataToSave);
            alert(`Empresa "${formData.nomeFantasia}" cadastrada com sucesso!`);
        }

        onSaveSuccess();
        onClose();
    } catch (err) {
        if (err instanceof ApiError) {
            alert(`Erro ao salvar empresa: ${err.message}`);
        } else {
            alert('Erro ao salvar empresa. Verifique sua conexão e tente novamente.');
        }
    } finally {
        setIsSaving(false);
    }
};
```

**Mapeamento de Campos:**

| Formulário (frontend) | API (backend) |
|-----------------------|---------------|
| `medico_nome` | `medicoNome` |
| `medico_crm` | `medicoCrm` |
| `inicio_validade` | `inicioValidade` |
| `revisar_ate` | `revisarAte` |

**Botão com Loading:**
```tsx
<button
    onClick={handleSave}
    disabled={isSaving}
    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
    {isSaving ? 'Salvando...' : 'Salvar'}
</button>
```

---

## 📁 Arquivos Modificados

### Arquivos Modificados:
1. `components/auth/LoginPage.tsx` - Login via API
2. `App.tsx` - Autenticação via API
3. `components/modals/EmpresaManagerModal.tsx` - CRUD de empresas via API

---

## 🔧 Como Funciona Agora

### Fluxo de Login

1. Usuário acessa http://localhost:3002
2. Digita credenciais (admin/admin)
3. Clica em "Entrar"
4. **LoginPage** chama `authApi.login()` → HTTP POST para `http://localhost:3001/api/auth/login`
5. Backend valida e retorna `{ user, token }`
6. Token salvo no `sessionStorage` como `occupational_health_session`
7. **App.tsx** recebe usuário via `onLoginSuccess(user)`
8. Usuário logado com sucesso

### Fluxo de Criar Empresa

1. Usuário clica em "+ Nova" empresa
2. Preenche formulário no **EmpresaManagerModal**
3. Clica em "Salvar"
4. Modal chama `empresaApi.create()` → HTTP POST para `http://localhost:3001/api/empresas`
5. Backend cria empresa no PostgreSQL
6. Retorna empresa criada com ID
7. Modal mostra "Empresa cadastrada com sucesso!"
8. Modal fecha e chama `onSaveSuccess()` → App recarrega dados

---

## ⚠️ Limitações Atuais

### 1. Dados Ainda Carregados do localStorage

**Problema:**
- Login e criação de empresas salvam na API
- MAS os dados exibidos ainda vêm do `dbService.loadDb()` (localStorage)
- Empresas criadas via API não aparecem na lista até recarregar a página

**Por quê?**
- `App.tsx` carrega dados via `dbService.loadDb()` no início
- `reloadData()` também chama `dbService.loadDb()`
- Não há sincronização entre API e localStorage

**Solução futura:**
- Modificar `reloadData()` para chamar `empresaApi.getAll()`
- Criar gerenciador de estado (Context API ou Zustand)
- Remover completamente dependência do localStorage

### 2. Apenas Autenticação e Empresas Integradas

**O que está integrado:**
- ✅ Login/Logout (authApi)
- ✅ Criar/Editar Empresas (empresaApi)

**O que ainda usa localStorage:**
- ❌ Listar empresas (ainda usa dbService)
- ❌ Funcionários
- ❌ Documentos
- ❌ Exames
- ❌ PCMSO
- ❌ Financeiro

### 3. Sem Sistema de Notificações

**Problema:**
- Ainda usamos `alert()` para feedback
- Não há sistema de toast/notificações elegante

**Solução futura:**
- Criar componente Toast
- Usar biblioteca como `react-hot-toast` ou `sonner`

---

## 🧪 Como Testar Agora

### Teste 1: Login via API

1. Abrir http://localhost:3002
2. Fazer logout se já estiver logado
3. Digitar `admin` / `admin`
4. Clicar em "Entrar"
5. **Esperado:** Login bem-sucedido, redirecionado para dashboard

**Verificar no DevTools (F12):**
- Network > POST /api/auth/login → Status 200
- Application > Session Storage → Verificar `occupational_health_session`

### Teste 2: Criar Empresa via API

1. Após login, ir para aba "Empresas"
2. Clicar em "+ Nova"
3. Preencher formulário:
   - **CNPJ:** 12.345.678/0001-90
   - **Razão Social:** Empresa Teste LTDA
   - **Nome Fantasia:** Teste
   - **Médico:** Dr. João Silva
   - **CRM:** 12345
   - **Início Validade:** 2025-01-01
   - **Revisar Até:** 2026-01-01
4. Clicar em "Salvar"
5. **Esperado:** Mensagem "Empresa 'Teste' cadastrada com sucesso!"

**Verificar no DevTools:**
- Network > POST /api/empresas → Status 201 (ou 200)
- Response body contém empresa criada com ID

**Verificar no Banco (Prisma Studio):**
```bash
cd backend
npx prisma studio
```
- Abrir tabela `Empresa`
- Verificar se empresa foi criada

### Teste 3: Editar Empresa via API

1. Selecionar empresa na lista
2. Clicar em "Editar"
3. Modificar Nome Fantasia
4. Clicar em "Salvar"
5. **Esperado:** Mensagem "Empresa atualizada com sucesso!"

**Verificar no DevTools:**
- Network > PUT /api/empresas/:id → Status 200

---

## 📊 Estatísticas

- **Arquivos modificados:** 3
- **Linhas modificadas:** ~150
- **Componentes integrados:** 3 (LoginPage, App, EmpresaManagerModal)
- **APIs integradas:** 2 (authApi, empresaApi)
- **Tempo de desenvolvimento:** ~1h

---

## 🎯 Próxima Sessão (05): Integração Completa de Dados

### Objetivos:

1. **Modificar App.tsx para carregar dados da API**
   - Substituir `dbService.loadDb()` por chamadas à API
   - Criar função `loadDataFromApi()`
   - Carregar empresas, funcionários, documentos, etc. da API
   - Implementar loading global

2. **Criar Gerenciador de Estado**
   - Context API ou Zustand
   - Centralizar dados da aplicação
   - Sincronizar com API
   - Remover dependência do localStorage

3. **Modificar FuncionariosTab**
   - Criar/editar funcionários via API
   - Listar funcionários da API
   - Filtros via query params

4. **Implementar Sistema de Toast**
   - Substituir `alert()` por toasts
   - Biblioteca: `react-hot-toast` ou `sonner`
   - Feedback visual elegante

5. **Loading States Globais**
   - Spinner durante carregamento inicial
   - Skeleton screens para listas
   - Indicadores de progresso

---

## 🔐 Segurança

### Implementado:
- ✅ Token JWT enviado via Authorization header
- ✅ SessionStorage (mais seguro que localStorage)
- ✅ Logout limpa sessionStorage
- ✅ Validação de campos obrigatórios

### Ainda precisa:
- ⚠️ Refresh token (auto-renovação)
- ⚠️ Expiração de sessão (auto-logout)
- ⚠️ HTTPS em produção
- ⚠️ Sanitização de inputs
- ⚠️ Rate limiting no frontend

---

## 📝 Conclusão

A Sessão 04 estabeleceu a **integração inicial** dos componentes com a API:

**Completado:**
- ✅ Login funcional via API
- ✅ Autenticação persistente (sessionStorage)
- ✅ Criar/editar empresas via API
- ✅ Loading states nos modais
- ✅ Tratamento de erros robusto
- ✅ Frontend compilando sem erros

**Pendente:**
- ⚠️ Carregar dados da API (ainda usa localStorage)
- ⚠️ Integrar funcionários
- ⚠️ Sistema de toast/notificações
- ⚠️ Gerenciador de estado global
- ⚠️ Loading states globais

**Progresso geral:** ~40% da integração frontend-backend completa

**Status:** Pronto para Sessão 05 - Integração Completa de Dados

---

**Última atualização:** 2025-11-11 13:20
**Próxima sessão:** Carregar dados da API e criar gerenciador de estado
