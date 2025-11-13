#!/bin/bash

# Script de setup do banco de dados PostgreSQL para o Sistema de Gestão de Saúde Ocupacional

set -e

echo "======================================"
echo "Setup do Banco de Dados - SST Software"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se o PostgreSQL está instalado
echo "Verificando se o PostgreSQL está instalado..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL não encontrado!${NC}"
    echo "Por favor, instale o PostgreSQL 14+ antes de continuar."
    echo "Visite: https://www.postgresql.org/download/"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL encontrado${NC}"
echo ""

# Ler configurações do .env se existir
if [ -f ".env" ]; then
    echo -e "${YELLOW}Carregando configurações do .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Valores padrão
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-Liloestit013}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="occupational_health"

echo "Configurações do banco:"
echo "  - Host: $DB_HOST"
echo "  - Porta: $DB_PORT"
echo "  - Usuário: $DB_USER"
echo "  - Banco: $DB_NAME"
echo ""

# Perguntar se deseja continuar
read -p "Deseja continuar com essas configurações? (S/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Setup cancelado."
    exit 0
fi

# Criar banco de dados
echo ""
echo "Criando banco de dados '$DB_NAME'..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Banco de dados criado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠ Banco de dados já existe (OK)${NC}"
fi

# Executar migrations
echo ""
echo "Executando migrations do Prisma..."
npm run prisma:generate
npm run prisma:migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations executadas com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao executar migrations${NC}"
    exit 1
fi

# Executar seed
echo ""
echo "Populando banco com dados iniciais..."
npm run prisma:seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dados iniciais inseridos com sucesso${NC}"
else
    echo -e "${YELLOW}⚠ Aviso: Erro ao inserir dados iniciais (pode já estar populado)${NC}"
fi

echo ""
echo -e "${GREEN}======================================"
echo "✓ Setup do banco concluído com sucesso!"
echo "======================================${NC}"
echo ""
echo "Você pode agora:"
echo "  1. Iniciar o backend: npm run dev"
echo "  2. Acessar Prisma Studio: npm run prisma:studio"
echo ""
echo "Credenciais padrão:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
