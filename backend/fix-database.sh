#!/bin/bash

echo "🔧 Script de Correção do Banco de Dados"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se PostgreSQL está rodando
echo "1️⃣  Verificando PostgreSQL..."
if PGPASSWORD=Liloestit013 psql -h localhost -U postgres -d occupational_health -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL está rodando!${NC}"
else
    echo -e "${RED}❌ PostgreSQL não está rodando!${NC}"
    echo ""
    echo "Por favor, inicie o PostgreSQL primeiro:"
    echo "  - Windows: Inicie o serviço 'postgresql-x64-18' em services.msc"
    echo "  - Docker: docker run --name sst-postgres -e POSTGRES_PASSWORD=Liloestit013 -e POSTGRES_DB=occupational_health -p 5432:5432 -d postgres:18"
    echo "  - Linux: sudo service postgresql start"
    echo ""
    exit 1
fi

# Verificar se o banco existe
echo ""
echo "2️⃣  Verificando banco de dados 'occupational_health'..."
if PGPASSWORD=Liloestit013 psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw occupational_health; then
    echo -e "${GREEN}✅ Banco de dados existe!${NC}"
else
    echo -e "${YELLOW}⚠️  Banco não existe, criando...${NC}"
    PGPASSWORD=Liloestit013 psql -h localhost -U postgres -c "CREATE DATABASE occupational_health;"
    echo -e "${GREEN}✅ Banco criado!${NC}"
fi

# Aplicar migration do tipo_arquivo
echo ""
echo "3️⃣  Aplicando migration: adicionar coluna tipo_arquivo..."
PGPASSWORD=Liloestit013 psql -h localhost -U postgres -d occupational_health << 'EOF'
ALTER TABLE "documentos_empresa" ADD COLUMN IF NOT EXISTS "tipo_arquivo" TEXT;
COMMENT ON COLUMN "documentos_empresa"."tipo_arquivo" IS 'MIME type of the document file (e.g., application/pdf, image/png)';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration aplicada com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao aplicar migration!${NC}"
    exit 1
fi

# Verificar se a coluna foi criada
echo ""
echo "4️⃣  Verificando se a coluna foi criada..."
if PGPASSWORD=Liloestit013 psql -h localhost -U postgres -d occupational_health -c "\d documentos_empresa" | grep -q tipo_arquivo; then
    echo -e "${GREEN}✅ Coluna 'tipo_arquivo' existe no banco!${NC}"
else
    echo -e "${RED}❌ Coluna não foi criada!${NC}"
    exit 1
fi

# Regenerar Prisma Client
echo ""
echo "5️⃣  Regenerando Prisma Client..."
npm run prisma:generate > /dev/null 2>&1 || PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client regenerado!${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível regenerar Prisma Client (mas pode funcionar mesmo assim)${NC}"
fi

# Sucesso
echo ""
echo -e "${GREEN}🎉 Correção concluída com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Reinicie o backend: npm run dev"
echo "  2. Teste salvar um documento no frontend"
echo ""
