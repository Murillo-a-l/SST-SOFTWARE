-- AlterTable
ALTER TABLE "documentos_empresa" ADD COLUMN "tipo_arquivo" TEXT;

-- Comment
COMMENT ON COLUMN "documentos_empresa"."tipo_arquivo" IS 'MIME type of the document file (e.g., application/pdf, image/png)';
