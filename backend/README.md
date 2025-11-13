# Backend - Sistema de Gestão de Saúde Ocupacional

Backend desenvolvido com Node.js, Express, TypeScript e Prisma ORM.

## 🎯 Status da Implementação

✅ **Fase 1 Completa:**
- [x] Estrutura base do Express + TypeScript
- [x] Prisma ORM configurado
- [x] Autenticação JWT com bcrypt
- [x] API REST para empresas e funcionários
- [x] Middleware de erro e segurança
- [x] Soft deletes implementados

## 🚀 Setup Inicial

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- npm ou yarn

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

1. Crie um banco PostgreSQL:
```sql
CREATE DATABASE occupational_health;
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Edite o `.env` com suas configurações:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/occupational_health?schema=public"
JWT_SECRET="troque-por-uma-chave-secreta-forte"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. Rodar Migrations

⚠️ **IMPORTANTE:** Antes de rodar as migrations, você precisa completar o schema do Prisma!

O arquivo `prisma/schema.prisma` contém apenas a parte inicial. Copie o conteúdo de `prisma/schema-extra.prisma` e cole ao final do `schema.prisma`.

Depois execute:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Popular Banco com Dados Iniciais

```bash
npm run prisma:seed
```

Isso criará:
- **Admin:** username: `admin` | senha: `admin`
- **User:** username: `joao.medico` | senha: `123`
- Tipos de documentos padrão

### 5. Iniciar Servidor

**Desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

O servidor estará rodando em: `http://localhost:3001`

## 📚 Documentação da API

### Base URL
```
http://localhost:3001/api
```

### Autenticação

#### POST /api/auth/login
Login no sistema

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "nome": "Administrador",
      "username": "admin",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me
Retorna dados do usuário autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "nome": "Administrador",
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

#### POST /api/auth/logout
Logout do sistema

---

### Empresas

#### GET /api/empresas
Lista todas as empresas

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "empresas": [
      {
        "id": 1,
        "razaoSocial": "Empresa Exemplo LTDA",
        "nomeFantasia": "Empresa Exemplo",
        "cnpj": "12.345.678/0001-00",
        "medicoNome": "Dr. João",
        "medicoCrm": "123456",
        ...
      }
    ]
  }
}
```

#### GET /api/empresas/:id
Busca empresa por ID

#### POST /api/empresas
Cria nova empresa (apenas ADMIN)

**Request:**
```json
{
  "razaoSocial": "Empresa Nova LTDA",
  "nomeFantasia": "Empresa Nova",
  "cnpj": "98.765.432/0001-00",
  "medicoNome": "Dr. Pedro",
  "medicoCrm": "654321",
  "inicioValidade": "2025-01-01",
  "revisarAte": "2026-01-01"
}
```

#### PUT /api/empresas/:id
Atualiza empresa (apenas ADMIN)

#### DELETE /api/empresas/:id
Exclui empresa - soft delete (apenas ADMIN)

---

### Funcionários

#### GET /api/funcionarios
Lista funcionários

**Query params:**
- `empresaId` (opcional): Filtrar por empresa
- `ativo` (opcional): true/false - Filtrar por ativo

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "funcionarios": [
      {
        "id": 1,
        "nome": "João Silva",
        "cpf": "123.456.789-00",
        "cargo": "Operador",
        "ativo": true,
        "empresa": {
          "id": 1,
          "nomeFantasia": "Empresa Exemplo"
        },
        "exames": [...]
      }
    ]
  }
}
```

#### GET /api/funcionarios/:id
Busca funcionário por ID

#### POST /api/funcionarios
Cria novo funcionário

**Request:**
```json
{
  "empresaId": 1,
  "nome": "Maria Santos",
  "cpf": "987.654.321-00",
  "cargo": "Operador de Máquinas",
  "setor": "Produção",
  "dataAdmissao": "2025-01-15",
  "ativo": true
}
```

#### PUT /api/funcionarios/:id
Atualiza funcionário

#### DELETE /api/funcionarios/:id
Exclui funcionário - soft delete

---

### Health Check

#### GET /api/health
Verifica se a API está rodando

**Response:**
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2025-11-09T12:00:00.000Z"
}
```

## 🔒 Segurança Implementada

- ✅ Senhas com hash bcrypt (salt rounds: 10)
- ✅ Autenticação JWT com expiração
- ✅ Middleware de autenticação e autorização
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Validação de unicidade (CPF, CNPJ)
- ✅ Soft deletes (não perde dados)
- ✅ Error handling centralizado

## 🗄️ Estrutura do Banco

O schema completo está em `prisma/schema.prisma` e inclui:

**Principais Entidades:**
- Users (autenticação)
- Empresas (com matriz/filial)
- Funcionários
- Exames Realizados
- Documentos (com pastas e tipos)
- PCMSO (cargos, ambientes, riscos, exames, protocolos)
- Financeiro (catálogo de serviços, serviços prestados, cobranças, NFe)

**Features do Schema:**
- Soft deletes em todas as tabelas principais
- Timestamps automáticos (createdAt, updatedAt)
- Índices para performance
- Relações com cascade/setNull
- Enums para status

## 📁 Estrutura de Arquivos

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco (INCOMPLETO - veja schema-extra.prisma)
│   └── schema-extra.prisma    # Resto do schema (copiar para schema.prisma)
├── src/
│   ├── config/
│   │   └── database.ts        # Configuração Prisma
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── empresa.controller.ts
│   │   └── funcionario.controller.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT auth + authorization
│   │   └── errorHandler.ts    # Error handling global
│   ├── routes/
│   │   ├── index.ts           # Rotas centralizadas
│   │   ├── auth.routes.ts
│   │   ├── empresa.routes.ts
│   │   └── funcionario.routes.ts
│   ├── services/              # (vazio - para lógica de negócio)
│   ├── utils/
│   │   ├── jwt.ts             # Helpers JWT
│   │   └── password.ts        # Helpers bcrypt
│   ├── prisma/
│   │   └── seed.ts            # Seed inicial
│   └── server.ts              # Servidor Express
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Próximos Passos

Para completar o backend, você precisará:

### Prioridade Alta:
1. ✅ ~~Implementar API de exames realizados~~
2. ✅ ~~Implementar API de documentos~~
3. ✅ ~~Implementar upload de arquivos (S3 ou local)~~
4. ✅ ~~Implementar API do módulo PCMSO~~
5. ✅ ~~Implementar API do módulo financeiro~~

### Prioridade Média:
6. Implementar validação de inputs com Zod
7. Implementar rate limiting
8. Implementar logging estruturado (Winston)
9. Testes unitários e de integração
10. Script de migração de localStorage para PostgreSQL

### Prioridade Baixa:
11. Documentação Swagger/OpenAPI
12. Docker e docker-compose
13. CI/CD
14. Monitoramento e alertas

## 🧪 Testando a API

### Com cURL:

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Listar empresas:**
```bash
curl http://localhost:3001/api/empresas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Postman/Insomnia:

1. Importe a collection (criar arquivo JSON se necessário)
2. Configure variável de ambiente com o token
3. Teste todos os endpoints

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### Erro: "relation does not exist"
```bash
npm run prisma:migrate
```

### Erro: "JWT_SECRET is not defined"
Verifique se o arquivo `.env` existe e está configurado

### Porta 3001 já em uso
Altere a variável `PORT` no `.env`

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
- `CLAUDE.md` na raiz do projeto
- `CHECKLIST-IMPLEMENTACAO.md` para ver o que falta

---

**Desenvolvido com ❤️ usando Node.js, Express, TypeScript e Prisma**
