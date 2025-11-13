import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Garante que o schema do banco de dados está atualizado
 * Cria campos que podem estar faltando
 */
export async function ensureSchemaUpdated(): Promise<void> {
  try {
    // Verificar e criar campo arquivo_assinado_url se não existir
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'documentos_empresa'
          AND column_name = 'arquivo_assinado_url'
        ) THEN
          ALTER TABLE documentos_empresa ADD COLUMN arquivo_assinado_url TEXT;
          RAISE NOTICE 'Campo arquivo_assinado_url criado com sucesso';
        ELSE
          RAISE NOTICE 'Campo arquivo_assinado_url já existe';
        END IF;
      END $$;
    `);

    console.log('✅ Schema do banco de dados verificado e atualizado');
  } catch (error) {
    console.error('❌ Erro ao verificar/atualizar schema:', error);
    // Não lançar erro para não travar a aplicação
  }
}
