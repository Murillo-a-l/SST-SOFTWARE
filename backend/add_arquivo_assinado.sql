-- Migration: Add arquivo_assinado_url field to documentos_empresa
-- Created: 2025-11-13

ALTER TABLE documentos_empresa
ADD COLUMN IF NOT EXISTS arquivo_assinado_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN documentos_empresa.arquivo_assinado_url IS 'Stores the signed version of the document (base64), keeping the original in arquivo_url';
