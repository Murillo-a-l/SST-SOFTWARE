import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  createExameSchema,
  updateExameSchema,
} from '../validators/eso.validators';

export async function getAllExames(req: Request, res: Response) {
  const exames = await prisma.globalExame.findMany({
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
    data: { exames },
  });
}

export async function getExameById(req: Request, res: Response) {
  const { id } = req.params;

  const exame = await prisma.globalExame.findUnique({
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

  if (!exame) {
    throw new AppError('Exame não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { exame },
  });
}

export async function createExame(req: Request, res: Response) {
  const validatedData = createExameSchema.parse(req.body);

  const exame = await prisma.globalExame.create({
    data: validatedData,
  });

  res.status(201).json({
    status: 'success',
    data: { exame },
  });
}

export async function updateExame(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateExameSchema.parse(req.body);

  const exame = await prisma.globalExame.update({
    where: { id },
    data: validatedData,
  });

  res.json({
    status: 'success',
    data: { exame },
  });
}

export async function deleteExame(req: Request, res: Response) {
  const { id } = req.params;

  // Verifica se tem cargos vinculados
  const count = await prisma.cargoExame.count({
    where: { exameId: id },
  });

  if (count > 0) {
    throw new AppError(`Exame possui ${count} cargo(s) vinculado(s). Não é possível deletar.`, 400);
  }

  await prisma.globalExame.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Exame deletado com sucesso',
  });
}
