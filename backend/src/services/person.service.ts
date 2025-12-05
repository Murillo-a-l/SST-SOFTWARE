import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PersonService {
  /**
   * Valida CPF único
   */
  async isCpfUnique(cpf: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.person.findUnique({
      where: { cpf },
    });

    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }

  /**
   * Verifica se uma pessoa tem vínculos ativos
   */
  async hasActiveVinculos(personId: string): Promise<boolean> {
    const count = await prisma.pessoaCargo.count({
      where: {
        personId,
        ativo: true,
      },
    });

    return count > 0;
  }

  /**
   * Busca todos os vínculos de uma pessoa
   */
  async getVinculos(personId: string) {
    return prisma.pessoaCargo.findMany({
      where: {
        personId,
      },
      include: {
        empresa: true,
        cargo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Valida se uma pessoa já tem vínculo ativo em uma empresa
   * Regra: Uma pessoa pode ter apenas um vínculo ativo por empresa
   */
  async hasActiveVinculoInCompany(personId: string, empresaId: string, excludeVinculoId?: string): Promise<boolean> {
    const existing = await prisma.pessoaCargo.findFirst({
      where: {
        personId,
        empresaId,
        ativo: true,
        NOT: excludeVinculoId ? { id: excludeVinculoId } : undefined,
      },
    });

    return existing !== null;
  }
}

export const personService = new PersonService();
