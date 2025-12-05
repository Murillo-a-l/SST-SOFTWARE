import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  createRiscoSchema,
  updateRiscoSchema,
} from '../validators/eso.validators';

export async function getAllRiscos(req: Request, res: Response) {
  const riscos = await prisma.globalRisco.findMany({
    include: {
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
    data: { riscos },
  });
}

export async function getRiscoById(req: Request, res: Response) {
  const { id } = req.params;

  const risco = await prisma.globalRisco.findUnique({
    where: { id },
    include: {
      cargos: {
        include: {
          cargo: {
            include: {
              empresa: true,
            },
          },
        },
      },
    },
  });

  if (!risco) {
    throw new AppError('Risco não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { risco },
  });
}

export async function createRisco(req: Request, res: Response) {
  const validatedData = createRiscoSchema.parse(req.body);

  const risco = await prisma.globalRisco.create({
    data: validatedData,
  });

  res.status(201).json({
    status: 'success',
    data: { risco },
  });
}

export async function updateRisco(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateRiscoSchema.parse(req.body);

  const risco = await prisma.globalRisco.update({
    where: { id },
    data: validatedData,
  });

  res.json({
    status: 'success',
    data: { risco },
  });
}

export async function deleteRisco(req: Request, res: Response) {
  const { id } = req.params;

  // Verifica se tem cargos vinculados
  const count = await prisma.cargoRisco.count({
    where: { riscoId: id },
  });

  if (count > 0) {
    throw new AppError(`Risco possui ${count} cargo(s) vinculado(s). Não é possível deletar.`, 400);
  }

  await prisma.globalRisco.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Risco deletado com sucesso',
  });
}
