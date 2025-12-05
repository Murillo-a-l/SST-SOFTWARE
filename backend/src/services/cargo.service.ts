import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CargoService {
  /**
   * Verifica se um cargo pode ser deletado
   * Regra: Não pode ter vínculos ativos
   */
  async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const vinculos = await prisma.pessoaCargo.count({
      where: {
        cargoId: id,
      },
    });

    if (vinculos > 0) {
      return {
        canDelete: false,
        reason: `Cargo possui ${vinculos} vínculo(s). Não é possível deletar.`
      };
    }

    return { canDelete: true };
  }

  /**
   * Ao deletar cargo, remove automaticamente todas as relações pivô
   */
  async deleteWithRelations(id: string) {
    // Prisma vai deletar automaticamente por causa do onDelete: Cascade
    return prisma.companyCargo.delete({
      where: { id },
    });
  }

  /**
   * Adiciona um risco ao cargo
   */
  async addRisco(cargoId: string, riscoId: string) {
    // Verifica se já existe
    const existing = await prisma.cargoRisco.findFirst({
      where: {
        cargoId,
        riscoId,
      },
    });

    if (existing) {
      throw new Error('Este risco já está associado ao cargo');
    }

    return prisma.cargoRisco.create({
      data: {
        cargoId,
        riscoId,
      },
      include: {
        risco: true,
      },
    });
  }

  /**
   * Remove um risco do cargo
   */
  async removeRisco(cargoId: string, riscoId: string) {
    return prisma.cargoRisco.deleteMany({
      where: {
        cargoId,
        riscoId,
      },
    });
  }

  /**
   * Adiciona um exame ao cargo
   */
  async addExame(cargoId: string, exameId: string) {
    // Verifica se já existe
    const existing = await prisma.cargoExame.findFirst({
      where: {
        cargoId,
        exameId,
      },
    });

    if (existing) {
      throw new Error('Este exame já está associado ao cargo');
    }

    return prisma.cargoExame.create({
      data: {
        cargoId,
        exameId,
      },
      include: {
        exame: true,
      },
    });
  }

  /**
   * Remove um exame do cargo
   */
  async removeExame(cargoId: string, exameId: string) {
    return prisma.cargoExame.deleteMany({
      where: {
        cargoId,
        exameId,
      },
    });
  }

  /**
   * Adiciona um ambiente ao cargo
   */
  async addAmbiente(cargoId: string, ambienteId: string) {
    // Verifica se já existe
    const existing = await prisma.cargoAmbiente.findFirst({
      where: {
        cargoId,
        ambienteId,
      },
    });

    if (existing) {
      throw new Error('Este ambiente já está associado ao cargo');
    }

    return prisma.cargoAmbiente.create({
      data: {
        cargoId,
        ambienteId,
      },
      include: {
        ambiente: true,
      },
    });
  }

  /**
   * Remove um ambiente do cargo
   */
  async removeAmbiente(cargoId: string, ambienteId: string) {
    return prisma.cargoAmbiente.deleteMany({
      where: {
        cargoId,
        ambienteId,
      },
    });
  }

  /**
   * Busca cargo completo com todas as relações
   */
  async findWithRelations(id: string) {
    return prisma.companyCargo.findUnique({
      where: { id },
      include: {
        empresa: true,
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
    });
  }
}

export const cargoService = new CargoService();
