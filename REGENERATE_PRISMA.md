# 🔧 INSTRUÇÕES: Regenerar Prisma Client

## ⚠️ PROBLEMA IDENTIFICADO

O Prisma Client foi gerado a partir de um schema ANTIGO onde os campos `medicoNome`, `medicoCrm`, `inicioValidade` e `revisarAte` eram **obrigatórios**.

O schema.prisma JÁ foi atualizado para torná-los **opcionais**, mas o Prisma Client (código gerado) ainda não foi regenerado.

**Erro atual:**
```
Argument `medicoNome` is missing.
```

---

## ✅ SOLUÇÃO

Execute os seguintes comandos NO TERMINAL (não no Claude Code):

### 1. Pare o backend se estiver rodando
Pressione `Ctrl+C` no terminal do backend

### 2. Entre na pasta do backend
```bash
cd backend
```

### 3. Regenere o Prisma Client
```bash
npm run prisma:generate
```

**Se der erro de network (403 Forbidden):**
```bash
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm run prisma:generate
```

### 4. Reinicie o backend
```bash
npm run dev
```

---

## 🧪 TESTE NOVAMENTE

Agora tente cadastrar uma empresa SEM preencher os campos do médico.

Deve funcionar! ✅

---

## 📝 O que aconteceu?

1. ✅ Schema.prisma foi atualizado com campos opcionais
2. ❌ Prisma Client não foi regenerado
3. ✅ Ao rodar `prisma:generate`, o client será regenerado com os campos corretos
4. ✅ O erro desaparece!

---

## ⚡ Se ainda der erro após regenerar

Me envie o LOG COMPLETO do terminal após executar os comandos acima.
