import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Converte uma string para Date de forma segura
 * Retorna null se a data for inválida ou não fornecida
 */
function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  // Verifica se a data é válida
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

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

  // Parse dates safely
  const inicioValidade = parseDate(data.inicioValidade);
  const revisarAte = parseDate(data.revisarAte);

  // Remove inicioValidade and revisarAte from data to set them explicitly
  const { inicioValidade: _, revisarAte: __, ...restData } = data;

  const empresa = await prisma.empresa.create({
    data: {
      ...restData,
      inicioValidade,
      revisarAte,
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

  // Parse dates safely
  const inicioValidade = data.inicioValidade !== undefined ? parseDate(data.inicioValidade) : undefined;
  const revisarAte = data.revisarAte !== undefined ? parseDate(data.revisarAte) : undefined;

  // Remove dates from data to set them explicitly
  const { inicioValidade: _, revisarAte: __, ...restData } = data;

  const updated = await prisma.empresa.update({
    where: { id: parseInt(id) },
    data: {
      ...restData,
      ...(inicioValidade !== undefined && { inicioValidade }),
      ...(revisarAte !== undefined && { revisarAte }),
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
