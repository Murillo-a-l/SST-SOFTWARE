import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  createAmbienteSchema,
  updateAmbienteSchema,
} from '../validators/eso.validators';

export async function getAllAmbientes(req: Request, res: Response) {
  const { empresaId } = req.query;

  const where = empresaId ? { empresaId: String(empresaId) } : {};

  const ambientes = await prisma.companyAmbiente.findMany({
    where,
    include: {
      empresa: true,
      _count: {
        select: {
          cargos: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    status: 'success',
    data: { ambientes },
  });
}

export async function getAmbienteById(req: Request, res: Response) {
  const { id } = req.params;

  const ambiente = await prisma.companyAmbiente.findUnique({
    where: { id },
    include: {
      empresa: true,
      cargos: {
        include: {
          cargo: true,
        },
      },
    },
  });

  if (!ambiente) {
    throw new AppError('Ambiente não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { ambiente },
  });
}

export async function createAmbiente(req: Request, res: Response) {
  const validatedData = createAmbienteSchema.parse(req.body);

  // Valida se a empresa existe
  const empresa = await prisma.company.findUnique({
    where: { id: validatedData.empresaId },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  const ambiente = await prisma.companyAmbiente.create({
    data: validatedData,
    include: {
      empresa: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { ambiente },
  });
}

export async function updateAmbiente(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateAmbienteSchema.parse(req.body);

  const ambiente = await prisma.companyAmbiente.update({
    where: { id },
    data: validatedData,
    include: {
      empresa: true,
    },
  });

  res.json({
    status: 'success',
    data: { ambiente },
  });
}

export async function deleteAmbiente(req: Request, res: Response) {
  const { id } = req.params;

  // Verifica se tem cargos vinculados
  const count = await prisma.cargoAmbiente.count({
    where: { ambienteId: id },
  });

  if (count > 0) {
    throw new AppError(`Ambiente possui ${count} cargo(s) vinculado(s). Não é possível deletar.`, 400);
  }

  await prisma.companyAmbiente.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Ambiente deletado com sucesso',
  });
}
