-- AlterTable
ALTER TABLE "empresas"
ALTER COLUMN "medico_nome" DROP NOT NULL,
ALTER COLUMN "medico_crm" DROP NOT NULL,
ALTER COLUMN "inicio_validade" DROP NOT NULL,
ALTER COLUMN "revisar_ate" DROP NOT NULL;
