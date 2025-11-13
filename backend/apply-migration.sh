#!/bin/bash

echo "🔄 Aplicando migration: adicionar campo arquivo_assinado_url"

# Extrair DATABASE_URL do .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📋 Usando configuração padrão do .env.example"
    DB_URL="postgresql://user:password@localhost:5432/occupational_health?schema=public"
else
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2 | tr -d '"')
fi

echo "🔗 Database URL: ${DB_URL}"

# Aplicar migration usando psql
psql "$DB_URL" <<EOF
-- Migration: Add arquivo_assinado_url field to documentos_empresa
-- Created: 2025-11-13

-- Adicionar coluna se não existir
ALTER TABLE documentos_empresa
ADD COLUMN IF NOT EXISTS arquivo_assinado_url TEXT;

-- Verificar se foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_empresa'
  AND column_name = 'arquivo_assinado_url';

EOF

if [ $? -eq 0 ]; then
    echo "✅ Migration aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar migration"
    exit 1
fi
