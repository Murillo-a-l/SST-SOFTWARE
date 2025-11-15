# 🔧 INSTRUÇÕES: Corrigir Campos Opcionais de Médico

## ⚠️ PROBLEMA IDENTIFICADO

Os campos `medicoNome`, `medicoCrm`, `inicioValidade` e `revisarAte` devem ser **OPCIONAIS**, mas:

1. ✅ O `schema.prisma` está correto (campos opcionais)
2. ⚠️ O **Prisma Client** precisa ser regenerado
3. ❌ O **banco de dados PostgreSQL** ainda tem as colunas como NOT NULL (obrigatórias)

**Erros possíveis:**
```
Argument `medicoNome` is missing. (antes de regenerar o client)
Null constraint violation on the fields: (`medico_nome`) (antes da migration)
```

---

## ✅ SOLUÇÃO COMPLETA

Execute os seguintes comandos **NO TERMINAL** (não no Claude Code):

### 1️⃣ Pare o backend
Pressione `Ctrl+C` no terminal onde o backend está rodando

### 2️⃣ Entre na pasta do backend
```bash
cd backend
```

### 3️⃣ Aplique a migration no banco de dados
```bash
npx prisma migrate deploy
```

**OU execute manualmente o SQL:**
```bash
npx prisma db execute --file prisma/migrations/20250115_make_medico_optional/migration.sql
```

**OU conecte no PostgreSQL e execute:**
```sql
ALTER TABLE "empresas" ALTER COLUMN "medico_nome" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "medico_crm" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "inicio_validade" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "revisar_ate" DROP NOT NULL;
```

### 4️⃣ Regenere o Prisma Client
```bash
npm run prisma:generate
```

**Se der erro de network (403 Forbidden):**
```bash
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm run prisma:generate
```

### 5️⃣ Reinicie o backend
```bash
npm run dev
```

---

## 🧪 TESTE NOVAMENTE

Agora tente cadastrar uma empresa **SEM** preencher os campos do médico.

Deve funcionar! ✅

---

## 📝 O que aconteceu?

1. ✅ Schema.prisma já estava correto (campos opcionais)
2. ✅ Prisma Client foi regenerado
3. ✅ Migration aplicada no banco (colunas agora aceitam NULL)
4. ✅ O erro desaparece!

---

## ⚡ Se ainda der erro após executar tudo

Me envie o LOG COMPLETO do terminal após executar os comandos acima.
