import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VinculoService {
  /**
   * Valida se pode criar um novo vínculo ativo
   * Regra: Uma pessoa pode ter apenas um vínculo ativo por empresa
   */
  async canCreateActive(personId: string, empresaId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const existing = await prisma.pessoaCargo.findFirst({
      where: {
        personId,
        empresaId,
        ativo: true,
      },
      include: {
        cargo: true,
      },
    });

    if (existing) {
      return {
        canCreate: false,
        reason: `A pessoa já possui vínculo ativo nesta empresa no cargo: ${existing.cargo.nome}`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Inativa um vínculo
   */
  async inativar(id: string, dataSaida?: Date) {
    return prisma.pessoaCargo.update({
      where: { id },
      data: {
        ativo: false,
        dataSaida: dataSaida || new Date(),
      },
    });
  }

  /**
   * Reativa um vínculo
   */
  async reativar(id: string) {
    const vinculo = await prisma.pessoaCargo.findUnique({
      where: { id },
    });

    if (!vinculo) {
      throw new Error('Vínculo não encontrado');
    }

    // Valida se pode reativar (não pode ter outro vínculo ativo na mesma empresa)
    const validation = await this.canCreateActive(vinculo.personId, vinculo.empresaId);
    if (!validation.canCreate) {
      throw new Error(validation.reason);
    }

    return prisma.pessoaCargo.update({
      where: { id },
      data: {
        ativo: true,
        dataSaida: null,
      },
    });
  }

  /**
   * Busca vínculos ativos de uma empresa
   */
  async getActiveByEmpresa(empresaId: string) {
    return prisma.pessoaCargo.findMany({
      where: {
        empresaId,
        ativo: true,
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

  /**
   * Busca vínculos inativos de uma empresa
   */
  async getInactiveByEmpresa(empresaId: string) {
    return prisma.pessoaCargo.findMany({
      where: {
        empresaId,
        ativo: false,
      },
      include: {
        person: true,
        cargo: true,
      },
      orderBy: {
        dataSaida: 'desc',
      },
    });
  }
}

export const vinculoService = new VinculoService();
