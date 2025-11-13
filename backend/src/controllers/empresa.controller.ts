import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export async function getAllEmpresas(req: Request, res: Response) {
  const empresas = await prisma.empresa.findMany({
    where: { deletedAt: null },
    include: {
      matriz: true,
      filiais: {
        where: { deletedAt: null },
      },
      _count: {
        select: {
          funcionarios: true,
          documentos: true,
        },
      },
    },
    orderBy: { nomeFantasia: 'asc' },
  });

  res.json({
    status: 'success',
    data: { empresas },
  });
}

export async function getEmpresaById(req: Request, res: Response) {
  const { id } = req.params;

  const empresa = await prisma.empresa.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
    include: {
      matriz: true,
      filiais: {
        where: { deletedAt: null },
      },
    },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  res.json({
    status: 'success',
    data: { empresa },
  });
}

export async function createEmpresa(req: Request, res: Response) {
  const data = req.body;

  // Validate CNPJ uniqueness
  const existingEmpresa = await prisma.empresa.findFirst({
    where: {
      cnpj: data.cnpj,
      deletedAt: null,
    },
  });

  if (existingEmpresa) {
    throw new AppError('CNPJ já cadastrado', 400);
  }

  const empresa = await prisma.empresa.create({
    data: {
      ...data,
      inicioValidade: new Date(data.inicioValidade),
      revisarAte: new Date(data.revisarAte),
    },
  });

  res.status(201).json({
    status: 'success',
    data: { empresa },
  });
}

export async function updateEmpresa(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;

  const empresa = await prisma.empresa.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  const updated = await prisma.empresa.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      inicioValidade: data.inicioValidade ? new Date(data.inicioValidade) : undefined,
      revisarAte: data.revisarAte ? new Date(data.revisarAte) : undefined,
    },
  });

  res.json({
    status: 'success',
    data: { empresa: updated },
  });
}

export async function deleteEmpresa(req: Request, res: Response) {
  const { id } = req.params;

  const empresa = await prisma.empresa.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  // Soft delete
  await prisma.empresa.update({
    where: { id: parseInt(id) },
    data: { deletedAt: new Date() },
  });

  res.json({
    status: 'success',
    message: 'Empresa excluída com sucesso',
  });
}
