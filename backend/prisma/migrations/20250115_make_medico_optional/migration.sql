-- AlterTable: Tornar campos de médico opcionais
ALTER TABLE "empresas" ALTER COLUMN "medico_nome" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "medico_crm" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "inicio_validade" DROP NOT NULL;
ALTER TABLE "empresas" ALTER COLUMN "revisar_ate" DROP NOT NULL;
