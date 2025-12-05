import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyService {
  /**
   * Verifica se uma empresa pode ser deletada
   * Regra: Não pode ter cargos, ambientes ou vínculos ativos
   */
  async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        cargos: true,
        ambientes: true,
        vinculos: true,
      },
    });

    if (!company) {
      return { canDelete: false, reason: 'Empresa não encontrada' };
    }

    if (company.cargos.length > 0) {
      return { canDelete: false, reason: `Empresa possui ${company.cargos.length} cargo(s) cadastrado(s)` };
    }

    if (company.ambientes.length > 0) {
      return { canDelete: false, reason: `Empresa possui ${company.ambientes.length} ambiente(s) cadastrado(s)` };
    }

    if (company.vinculos.length > 0) {
      return { canDelete: false, reason: `Empresa possui ${company.vinculos.length} vínculo(s) de funcionário(s)` };
    }

    return { canDelete: true };
  }

  /**
   * Valida CNPJ único
   */
  async isCnpjUnique(cnpj: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.company.findUnique({
      where: { cnpj },
    });

    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }

  /**
   * Valida se uma empresa matriz existe
   */
  async validateMatriz(matrizId: string): Promise<boolean> {
    const matriz = await prisma.company.findUnique({
      where: { id: matrizId },
    });

    return matriz !== null && matriz.matriz === true;
  }

  /**
   * Busca todas as filiais de uma matriz
   */
  async getFiliais(matrizId: string) {
    return prisma.company.findMany({
      where: {
        empresaMatrizId: matrizId,
      },
      orderBy: {
        nomeFantasia: 'asc',
      },
    });
  }

  /**
   * Busca todos os cargos de uma empresa
   */
  async getCargos(empresaId: string) {
    return prisma.companyCargo.findMany({
      where: {
        empresaId,
      },
      include: {
        riscos: {
          include: {
            risco: true,
          },
        },
        exames: {
          include: {
            exame: true,
          },
        },
        ambientes: {
          include: {
            ambiente: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  /**
   * Busca todos os ambientes de uma empresa
   */
  async getAmbientes(empresaId: string) {
    return prisma.companyAmbiente.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  /**
   * Busca todas as pessoas vinculadas a uma empresa
   */
  async getPessoas(empresaId: string) {
    return prisma.pessoaCargo.findMany({
      where: {
        empresaId,
      },
      include: {
        person: true,
        cargo: true,
      },
      orderBy: {
        person: {
          nome: 'asc',
        },
      },
    });
  }
}

export const companyService = new CompanyService();
