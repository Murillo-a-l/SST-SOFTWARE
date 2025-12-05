# 🚀 Próximo Passo - Instalar PostgreSQL

**Status Atual**: ✅ Backend corrigido e compilando perfeitamente (0 erros)
**Bloqueio**: ⚠️ PostgreSQL não instalado

---

## 📥 Opção 1: PostgreSQL Standalone (Recomendado)

### Download
👉 https://www.postgresql.org/download/windows/

### Instalação
1. Baixar o instalador para Windows
2. Executar o instalador
3. Durante a instalação:
   - **Senha do postgres**: `password` (ou outra de sua escolha)
   - **Porta**: `5432` (padrão)
   - **Locale**: Portuguese, Brazil
4. Marcar para instalar:
   - PostgreSQL Server ✅
   - pgAdmin 4 ✅ (opcional, mas recomendado)
   - Command Line Tools ✅

### Após Instalação

#### Criar o Banco de Dados

**Opção A: Via pgAdmin (GUI)**
1. Abrir pgAdmin
2. Conectar no servidor local
3. Clicar com botão direito em "Databases"
4. Create → Database
5. Nome: `ocupalli_test`
6. Save

**Opção B: Via linha de comando (psql)**
```bash
# Abrir PowerShell como Administrador
psql -U postgres
# Digitar a senha que você configurou

# Dentro do psql:
CREATE DATABASE ocupalli_test;
\q
```

---

## 🐳 Opção 2: Docker (Se preferir)

### Instalar Docker Desktop
👉 https://www.docker.com/products/docker-desktop/

### Após instalação do Docker

```bash
# Criar container PostgreSQL
docker run --name ocupalli-postgres ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=ocupalli_test ^
  -p 5432:5432 ^
  -d postgres:16

# Verificar se está rodando
docker ps

# Ver logs (se necessário)
docker logs ocupalli-postgres
```

---

## ✅ Depois do PostgreSQL Instalado

### 1. Atualizar .env (se necessário)

Abrir `nestjs-backend/.env` e verificar se a senha do PostgreSQL está correta:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/ocupalli_test?schema=public"
```

Se você usou senha diferente de `password`, alterar `SUA_SENHA`.

### 2. Gerar Cliente Prisma

```bash
cd C:\Users\Murillo Augusto\Downloads\occupational-health-management-system\nestjs-backend

npm run prisma:generate
```

**Saída esperada**: ✔ Generated Prisma Client

### 3. Executar Migrations

```bash
npm run prisma:migrate
```

**Saída esperada**:
- Migrations aplicadas com sucesso
- Tabelas criadas no banco

### 4. Popular com Dados de Teste

```bash
npm run prisma:seed
```

**Saída esperada**:
```
🌱 Seed iniciado...
✅ Seed concluído com sucesso!
  - 1 admin user
  - 5 users (doctors/recepcionistas)
  - 2 clinic units
  - 4 rooms
  - 2 companies
  - 4 jobs
  - 4 workers
  - 4 employments
  - 10 procedures
  - 4 appointments
```

### 5. Iniciar o Servidor

```bash
npm run dev
```

**Saída esperada**:
```
[Nest] Application successfully started
[Nest] Server running on http://localhost:3000
```

### 6. Testar no Navegador

Abrir no navegador:
- **Swagger (Documentação da API)**: http://localhost:3000/api/docs
- **Endpoint de teste**: http://localhost:3000/api/health

---

## 🔐 Credenciais de Teste

Depois do seed, você pode fazer login com:

### Admin
- **Usuário**: `admin`
- **Senha**: `admin`
- **Role**: ADMIN

### Médico
- **Usuário**: `joao.medico`
- **Senha**: `123`
- **Role**: DOCTOR

### Recepcionista
- **Usuário**: `maria.recep`
- **Senha**: `123`
- **Role**: RECEPTIONIST

---

## 🧪 Testar a API

### Via Swagger (Recomendado)
1. Abrir http://localhost:3000/api/docs
2. Clicar em "POST /api/auth/login"
3. Clicar em "Try it out"
4. Preencher:
   ```json
   {
     "username": "admin",
     "password": "admin"
   }
   ```
5. Clicar em "Execute"
6. Copiar o `access_token` retornado
7. Clicar no botão "Authorize" no topo
8. Colar o token
9. Agora pode testar todos os endpoints!

### Via curl (Linha de comando)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin\"}"

# Listar empresas (substitua TOKEN pelo token recebido)
curl http://localhost:3000/api/companies ^
  -H "Authorization: Bearer TOKEN"
```

---

## ❓ Problemas Comuns

### PostgreSQL não inicia
```bash
# Verificar se o serviço está rodando
sc query postgresql-x64-16

# Iniciar serviço
net start postgresql-x64-16
```

### Erro de conexão ao banco
1. Verificar se PostgreSQL está rodando
2. Verificar senha no .env
3. Verificar se o banco `ocupalli_test` foi criado
4. Verificar se a porta 5432 está livre

### Migrations falham
```bash
# Resetar e recriar tudo
npm run prisma:reset
```

---

## 📚 Documentação Gerada

Consulte os seguintes arquivos para mais detalhes:

- `RELATORIO-TESTES.md` - Relatório completo dos testes e correções
- `TESTES-REALIZADOS.md` - Detalhes técnicos de todas as correções
- `CHECKLIST-VALIDACAO.md` - Checklist de validação completo

---

## ✅ Resumo

1. ✅ **Backend corrigido**: 0 erros, 114 erros foram corrigidos
2. ⚠️ **Instalar PostgreSQL**: Único passo pendente
3. ⏳ **Executar migrations**: Logo após PostgreSQL
4. ⏳ **Executar seed**: Popula dados de teste
5. ⏳ **Iniciar servidor**: `npm run dev`
6. ⏳ **Testar API**: Via Swagger

**Tempo estimado**: 15-30 minutos (incluindo instalação do PostgreSQL)

---

**Boa sorte! 🚀**
