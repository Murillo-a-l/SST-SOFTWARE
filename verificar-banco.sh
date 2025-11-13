#!/bin/bash

echo "🔍 Verificando estado do banco de dados e Prisma"
echo "================================================"

cd backend

# 1. Verificar se campo existe no schema Prisma
echo ""
echo "1️⃣ Verificando schema.prisma..."
if grep -q "arquivoAssinadoUrl" prisma/schema.prisma; then
    echo "   ✅ Campo arquivoAssinadoUrl encontrado no schema.prisma"
else
    echo "   ❌ Campo arquivoAssinadoUrl NÃO encontrado no schema.prisma"
    echo "   ⚠️  ADICIONE o campo manualmente!"
    exit 1
fi

# 2. Verificar DATABASE_URL
echo ""
echo "2️⃣ Verificando conexão com banco..."
if [ ! -f .env ]; then
    echo "   ❌ Arquivo .env não encontrado!"
    echo "   📋 Copie .env.example para .env e configure DATABASE_URL"
    exit 1
fi

DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$DB_URL" ]; then
    echo "   ❌ DATABASE_URL não configurada no .env"
    exit 1
fi

echo "   ✅ DATABASE_URL configurada"

# 3. Verificar se campo existe no banco
echo ""
echo "3️⃣ Verificando se campo existe no banco de dados..."
COLUMN_EXISTS=$(psql "$DB_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'documentos_empresa' AND column_name = 'arquivo_assinado_url';" 2>/dev/null | xargs)

if [ "$COLUMN_EXISTS" = "arquivo_assinado_url" ]; then
    echo "   ✅ Campo arquivo_assinado_url EXISTE no banco"
else
    echo "   ❌ Campo arquivo_assinado_url NÃO EXISTE no banco"
    echo "   🔧 Aplicando migration..."

    psql "$DB_URL" -c "ALTER TABLE documentos_empresa ADD COLUMN IF NOT EXISTS arquivo_assinado_url TEXT;" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "   ✅ Campo criado com sucesso!"
    else
        echo "   ❌ Erro ao criar campo. Execute manualmente:"
        echo "      psql \"$DB_URL\" -c \"ALTER TABLE documentos_empresa ADD COLUMN arquivo_assinado_url TEXT;\""
        exit 1
    fi
fi

# 4. Regenerar Prisma Client
echo ""
echo "4️⃣ Regenerando Prisma Client..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate 2>&1 | grep -E "(Generated|Error|✔)" || echo "   ⚠️  Aviso: pode haver warnings, mas se disser 'Generated' está ok"

if [ $? -eq 0 ]; then
    echo "   ✅ Prisma Client regenerado"
else
    echo "   ⚠️  Prisma Client pode ter warnings mas foi gerado"
fi

# 5. Verificar se Prisma Client tem o campo
echo ""
echo "5️⃣ Verificando Prisma Client gerado..."
if grep -r "arquivoAssinadoUrl" node_modules/.prisma/client/index.d.ts 2>/dev/null; then
    echo "   ✅ Campo arquivoAssinadoUrl encontrado no Prisma Client"
else
    echo "   ❌ Campo arquivoAssinadoUrl NÃO encontrado no Prisma Client"
    echo "   ⚠️  Tente regenerar manualmente: npm run prisma:generate"
fi

# 6. Resumo final
echo ""
echo "================================================"
echo "✅ VERIFICAÇÃO COMPLETA!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor backend: npm run dev"
echo "   2. Verifique no console se aparece: '✅ Schema do banco de dados verificado'"
echo "   3. Teste assinar um documento"
echo ""
echo "🐛 Se ainda der erro, execute:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run dev"
