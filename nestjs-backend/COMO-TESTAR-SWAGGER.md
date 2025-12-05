# 🧪 Como Testar no Swagger

## 📍 Acessar o Swagger

Abra seu navegador e acesse:
👉 **http://localhost:3000/api/docs**

---

## 🔐 Como Fazer Login

### Passo 1: Encontrar o Endpoint de Login

1. Na página do Swagger, procure por **"auth"** na lista de tags
2. Clique em **"POST /api/v1/auth/login"**
3. Clique no botão **"Try it out"**

### Passo 2: Preencher as Credenciais

**IMPORTANTE**: Use exatamente este JSON (copie e cole):

```json
{
  "email": "admin@ocupalli.com.br",
  "password": "admin123"
}
```

### Passo 3: Executar

1. Clique no botão **"Execute"**
2. Aguarde a resposta

### Resposta Esperada ✅

Se tudo estiver correto, você verá algo como:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "cmil0noz30000bns2jq2l7v8u",
    "name": "Administrador",
    "email": "admin@ocupalli.com.br",
    "role": "ADMIN"
  }
}
```

---

## 🔑 Como Autorizar Outros Endpoints

Depois de fazer login com sucesso:

### Passo 1: Copiar o Access Token

Na resposta do login, copie o valor do campo `accessToken` (sem as aspas)

Exemplo:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG9jdXBhbGxpLmNvbS5iciIsInN1YiI6ImNtaWwwbm96MzAwMDBibnMyanEybDd2OHUiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQ0NjcwNTUsImV4cCI6MTc2NDQ2Nzk1NX0.K3o4sg_dL4Ao0VlFlJTVy-A4MlPkfxO_orhNX6b3QWY
```

### Passo 2: Autorizar no Swagger

1. No topo da página do Swagger, procure o botão **"Authorize"** 🔓
2. Clique nele
3. Cole o token no campo **"Value"**
4. Clique em **"Authorize"**
5. Clique em **"Close"**

Agora todos os endpoints protegidos estarão acessíveis! 🎉

---

## 👥 Credenciais Disponíveis

### Admin
```json
{
  "email": "admin@ocupalli.com.br",
  "password": "admin123"
}
```

### Médico
```json
{
  "email": "joao.silva@ocupalli.com.br",
  "password": "doctor123"
}
```

### Recepcionista
```json
{
  "email": "maria.recepcao@ocupalli.com.br",
  "password": "recepcao123"
}
```

### Técnico
```json
{
  "email": "carlos.tecnico@ocupalli.com.br",
  "password": "tecnico123"
}
```

---

## ⚠️ Possíveis Problemas e Soluções

### Erro: "Credenciais inválidas"

**Causas possíveis:**

1. **Email digitado errado**
   - ✅ Certifique-se de usar `admin@ocupalli.com.br` (com `.br`)
   - ❌ Não use `admin@ocupalli.com` (sem `.br`)

2. **Senha digitada errada**
   - ✅ Use exatamente `admin123`
   - ❌ Não adicione espaços extras

3. **Formato JSON incorreto**
   - ✅ Use aspas duplas (`"`)
   - ❌ Não use aspas simples (`'`)
   - ✅ Não esqueça a vírgula entre os campos

4. **Campos extras ou faltando**
   - ✅ Use apenas `email` e `password`
   - ❌ Não adicione outros campos

### Erro: "Internal Server Error"

Se você ver este erro mas as credenciais estão corretas:

1. Verifique se o servidor está rodando
2. Verifique os logs do servidor no terminal
3. Tente fazer logout e login novamente

### Como Verificar os Logs

Abra o terminal onde o servidor está rodando e procure por mensagens de erro em vermelho.

---

## 🧪 Endpoints para Testar Depois do Login

Depois de fazer login e autorizar, experimente estes endpoints:

### 1. GET /api/v1/auth/me
**Descrição**: Ver seus dados de usuário

**Como usar:**
1. Encontre o endpoint `GET /api/v1/auth/me`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta esperada:**
```json
{
  "id": "...",
  "name": "Administrador",
  "email": "admin@ocupalli.com.br",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2025-11-30T01:03:07.311Z",
  "updatedAt": "2025-11-30T01:03:07.311Z"
}
```

### 2. GET /api/v1/companies
**Descrição**: Listar todas as empresas

**Como usar:**
1. Encontre o endpoint `GET /api/v1/companies`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta esperada:**
Você verá uma lista com 3 empresas:
- Tech Solutions Ltda
- Construção & Engenharia S.A. (INADIMPLENTE)
- Indústria Metal Forte Ltda

### 3. GET /api/v1/workers
**Descrição**: Listar todos os trabalhadores

**Como usar:**
1. Encontre o endpoint `GET /api/v1/workers`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta esperada:**
Você verá uma lista com 4 trabalhadores:
- Pedro Henrique Santos
- Ana Paula Oliveira
- Carlos Eduardo Silva
- Juliana Ferreira Costa

### 4. GET /api/v1/appointments/waiting-room
**Descrição**: Ver pacientes na sala de espera

**Como usar:**
1. Encontre o endpoint `GET /api/v1/appointments/waiting-room`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta esperada:**
Você verá 1 paciente na sala de espera (Pedro - status WAITING)

### 5. GET /api/v1/companies/delinquent
**Descrição**: Listar empresas inadimplentes

**Como usar:**
1. Encontre o endpoint `GET /api/v1/companies/delinquent`
2. Clique em "Try it out"
3. Clique em "Execute"

**Resposta esperada:**
Você verá 1 empresa inadimplente (Construção & Engenharia S.A.)

---

## 📊 Exemplos de Teste Completos

### Exemplo 1: Criar uma Nova Empresa

1. Faça login e autorize
2. Encontre `POST /api/v1/companies`
3. Use este JSON:

```json
{
  "corporateName": "Minha Empresa Ltda",
  "tradeName": "MinhaEmpresa",
  "cnpj": "12345678000199",
  "email": "contato@minhaempresa.com.br",
  "phone": "+5511999999999",
  "address": "Rua Exemplo, 123 - São Paulo/SP"
}
```

### Exemplo 2: Criar um Novo Trabalhador

1. Faça login e autorize
2. Primeiro, pegue o ID de uma empresa (GET /api/v1/companies)
3. Encontre `POST /api/v1/workers`
4. Use este JSON (substitua o companyId):

```json
{
  "name": "João da Silva",
  "cpf": "12345678900",
  "birthDate": "1990-01-15",
  "gender": "MALE",
  "phone": "+5511988888888",
  "email": "joao@example.com",
  "companyId": "COLE_O_ID_DA_EMPRESA_AQUI"
}
```

### Exemplo 3: Atualizar Status de Agendamento

1. Faça login e autorize
2. Pegue o ID de um agendamento (GET /api/v1/appointments)
3. Encontre `PATCH /api/v1/appointments/{id}/status/{newStatus}`
4. Preencha:
   - `id`: ID do agendamento
   - `newStatus`: WAITING (ou outro status válido)
5. Execute

---

## ✅ Checklist de Teste

Marque conforme for testando:

### Autenticação
- [ ] Login com admin
- [ ] Login com médico
- [ ] Login com recepcionista
- [ ] Ver dados do usuário logado (/me)
- [ ] Refresh token
- [ ] Logout

### Empresas
- [ ] Listar empresas
- [ ] Listar inadimplentes
- [ ] Criar empresa
- [ ] Buscar empresa por ID
- [ ] Atualizar empresa
- [ ] Marcar/desmarcar inadimplência

### Trabalhadores
- [ ] Listar trabalhadores
- [ ] Buscar por CPF
- [ ] Criar trabalhador
- [ ] Atualizar trabalhador
- [ ] Desativar trabalhador
- [ ] Reativar trabalhador

### Agendamentos
- [ ] Listar agendamentos
- [ ] Sala de espera
- [ ] Criar agendamento
- [ ] Atualizar status
- [ ] Adicionar procedimentos
- [ ] Remover procedimentos

### Procedimentos
- [ ] Listar procedimentos
- [ ] Buscar por código
- [ ] Criar procedimento
- [ ] Atualizar procedimento

### Documentos
- [ ] Listar documentos
- [ ] Criar ASO
- [ ] Finalizar documento
- [ ] Listar demissionais

---

## 🎯 Conclusão

Se você seguiu todos os passos acima e está conseguindo:
- ✅ Fazer login
- ✅ Autorizar endpoints
- ✅ Listar empresas, trabalhadores, etc.

**Parabéns! A API está funcionando perfeitamente!** 🎉

Se ainda tiver problemas, verifique:
1. Servidor está rodando em http://localhost:3000
2. Swagger está acessível em http://localhost:3000/api/docs
3. Credenciais estão corretas (email e senha)
4. Token foi copiado e colado corretamente

---

**Documentação Completa**: Ver `SUCESSO-TESTES.md` para mais detalhes.
