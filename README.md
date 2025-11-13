# Sistema de Gestão de Saúde Ocupacional

Sistema completo para gerenciamento de medicina ocupacional, exames, documentos e faturamento.

## Tecnologias

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL 18 + Prisma ORM
- **Autenticação**: JWT

## Pré-requisitos

- Node.js 18+
- PostgreSQL 18+
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/occupational-health-management-system.git
cd occupational-health-management-system
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/occupational_health"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui"

# NFS-e (Opcional - se não usar, configurar via interface)
NFSE_IPM_LOGIN="seu-cnpj"
NFSE_IPM_SENHA="sua-senha"
NFSE_IPM_CIDADE="8055"
NFSE_IPM_MODO_TESTE="true"
```

Execute as migrations:

```bash
npm run prisma:migrate
```

Inicie o backend:

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd ..  # voltar para a raiz
npm install
```

Crie o arquivo `.env.local` na raiz:

```env
VITE_GEMINI_API_KEY=sua-chave-api-gemini-aqui
```

Inicie o frontend:

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3002`

## Credenciais Padrão

- **Usuário**: admin
- **Senha**: admin

## Estrutura do Projeto

```
.
├── backend/              # API Node.js
│   ├── src/
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Serviços (NFS-e, etc)
│   │   └── middleware/  # Autenticação, etc
│   └── prisma/          # Schema do banco de dados
├── components/          # Componentes React
├── services/           # Serviços do frontend
└── types.ts           # Tipos TypeScript compartilhados
```

## Funcionalidades

- ✅ Gestão de empresas (matriz e filiais)
- ✅ Cadastro de funcionários
- ✅ Registro de exames ocupacionais
- ✅ Gerenciamento de documentos (ASO, PGR, PCMSO, etc.)
- ✅ Sistema de assinatura de documentos
- ✅ Módulo financeiro (serviços, cobranças, NF-e)
- ✅ Emissão de NFS-e (IPM/AtendeNet)
- ✅ Relatórios
- ✅ Integração com Google Gemini AI

## Configuração de NFS-e

A configuração de NFS-e pode ser feita de duas formas:

1. **Via interface do sistema**: Configurações > Configuração de NFS-e
2. **Via arquivo .env**: Definindo as variáveis `NFSE_IPM_*`

## Scripts Disponíveis

### Backend
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm run prisma:migrate` - Executa migrations do banco
- `npm run prisma:studio` - Abre interface visual do banco

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## Licença

MIT
