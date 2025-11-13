# 🔴 Solução: Erro 500 ao Salvar Documento

**Erro:** `POST http://localhost:3001/api/documentos 500 (Internal Server Error)`

**Causa:** O campo `tipoArquivo` foi adicionado ao código, mas:
1. ❌ PostgreSQL não está rodando
2. ❌ Migration não foi aplicada no banco de dados
3. ❌ Backend tentando inserir em coluna que não existe

---

## ✅ Solução Rápida (Escolha uma opção)

### **Opção 1: Iniciar PostgreSQL no Windows**

Se você está no **Windows** com PostgreSQL instalado:

```bash
# Abra o "Serviços" do Windows (services.msc) e inicie "postgresql-x64-18"
# OU use o pgAdmin
# OU via linha de comando:
net start postgresql-x64-18
```

Depois:
```bash
cd backend
npm run prisma:migrate
npm run dev
```

---

### **Opção 2: Usar Docker (Recomendado)**

Se você tem Docker instalado:

```bash
# 1. Criar container PostgreSQL
docker run --name sst-postgres \
  -e POSTGRES_PASSWORD=Liloestit013 \
  -e POSTGRES_DB=occupational_health \
  -p 5432:5432 \
  -d postgres:18

# 2. Aplicar migrations
cd backend
npx prisma migrate deploy

# 3. Reiniciar backend
npm run dev
```

---

### **Opção 3: Aplicar Migration Manualmente**

Se o PostgreSQL já está rodando em outro terminal:

```bash
# 1. Conectar ao banco e aplicar SQL
psql -h localhost -U postgres -d occupational_health
# Digite a senha: Liloestit013

# Dentro do psql, execute:
ALTER TABLE "documentos_empresa" ADD COLUMN IF NOT EXISTS "tipo_arquivo" TEXT;
COMMENT ON COLUMN "documentos_empresa"."tipo_arquivo" IS 'MIME type do arquivo';
\q

# 2. Voltar ao backend e reiniciar
cd /home/user/SST-SOFTWARE/backend
npm run dev
```

---

## 🧪 Verificar se Funcionou

Após executar uma das opções acima:

1. ✅ Backend deve iniciar sem erros na porta 3001
2. ✅ Frontend deve conseguir salvar documentos
3. ✅ No F12 não deve mais aparecer erro 500

**Teste:**
- Vá em **Empresas** → **Documentos** → **+ Documento**
- Faça upload de um PDF
- Preencha os campos
- Clique em **Salvar Documento**
- ✅ Deve salvar com sucesso!

---

## 📋 Checklist de Diagnóstico

Se ainda der erro, verifique:

```bash
# 1. PostgreSQL está rodando?
psql -h localhost -U postgres -d occupational_health -c "SELECT 1"
# Deve retornar: 1

# 2. Backend está rodando?
curl http://localhost:3001/api/health
# Deve retornar: 200 OK

# 3. Coluna existe no banco?
psql -h localhost -U postgres -d occupational_health -c "\d documentos_empresa" | grep tipo_arquivo
# Deve mostrar a coluna tipo_arquivo
```

---

## ⚡ Solução Express (Copy & Paste)

Se você só quer que funcione rápido, execute isso no terminal:

```bash
# Terminal 1: Iniciar PostgreSQL (Docker)
docker run --name sst-postgres -e POSTGRES_PASSWORD=Liloestit013 -e POSTGRES_DB=occupational_health -p 5432:5432 -d postgres:18

# Terminal 1: Aplicar migration
cd /home/user/SST-SOFTWARE/backend
npx prisma migrate deploy
npm run dev

# Terminal 2: Frontend
cd /home/user/SST-SOFTWARE
npm run dev
```

**Pronto!** Agora teste salvar um documento.

---

## 🔍 O Que Aconteceu?

Quando adicionamos o campo `tipoArquivo`:

1. ✅ Modificamos o `schema.prisma` (código)
2. ✅ Criamos o arquivo de migration SQL
3. ❌ **NÃO aplicamos** a migration no banco de dados físico
4. ❌ PostgreSQL estava desligado

Resultado: Backend tentou inserir na coluna `tipo_arquivo` que não existe → **Erro 500**

---

## 📝 Para Não Esquecer

**Sempre que modificar o schema.prisma:**
```bash
cd backend
npx prisma migrate dev --name descricao_da_mudanca
```

Isso:
- Cria a migration
- Aplica no banco automaticamente
- Regenera o Prisma Client

---

**Desenvolvido por:** Claude (Anthropic)
**Branch:** claude/evaluate-fixes-needed-011CV5wv9PyX5Je3Nf5kLZ2y
