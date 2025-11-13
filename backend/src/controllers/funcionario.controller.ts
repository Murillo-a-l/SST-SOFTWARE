import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export async function getAllFuncionarios(req: Request, res: Response) {
  const { empresaId, ativo } = req.query;

  const where: any = { deletedAt: null };

  if (empresaId) {
    where.empresaId = parseInt(empresaId as string);
  }

  if (ativo !== undefined) {
    where.ativo = ativo === 'true';
  }

  const funcionarios = await prisma.funcionario.findMany({
    where,
    include: {
      empresa: {
        select: {
          id: true,
          nomeFantasia: true,
        },
      },
      exames: {
        where: { deletedAt: null },
        orderBy: { dataRealizacao: 'desc' },
        take: 5,
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    status: 'success',
    data: { funcionarios },
  });
}

export async function getFuncionarioById(req: Request, res: Response) {
  const { id } = req.params;

  const funcionario = await prisma.funcionario.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
    include: {
      empresa: true,
      exames: {
        where: { deletedAt: null },
        orderBy: { dataRealizacao: 'desc' },
      },
    },
  });

  if (!funcionario) {
    throw new AppError('Funcionário não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { funcionario },
  });
}

export async function createFuncionario(req: Request, res: Response) {
  const data = req.body;

  // Validate CPF uniqueness if provided
  if (data.cpf) {
    const existingFuncionario = await prisma.funcionario.findFirst({
      where: {
        cpf: data.cpf,
        deletedAt: null,
      },
    });

    if (existingFuncionario) {
      throw new AppError('CPF já cadastrado', 400);
    }
  }

  // Validate empresa exists
  const empresa = await prisma.empresa.findFirst({
    where: {
      id: data.empresaId,
      deletedAt: null,
    },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  const funcionario = await prisma.funcionario.create({
    data: {
      ...data,
      dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : null,
      dataUltimoExame: data.dataUltimoExame ? new Date(data.dataUltimoExame) : null,
    },
    include: {
      empresa: {
        select: {
          id: true,
          nomeFantasia: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: { funcionario },
  });
}

export async function updateFuncionario(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;

  const funcionario = await prisma.funcionario.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
  });

  if (!funcionario) {
    throw new AppError('Funcionário não encontrado', 404);
  }

  // Validate CPF uniqueness if changed
  if (data.cpf && data.cpf !== funcionario.cpf) {
    const existingFuncionario = await prisma.funcionario.findFirst({
      where: {
        cpf: data.cpf,
        deletedAt: null,
        id: { not: parseInt(id) },
      },
    });

    if (existingFuncionario) {
      throw new AppError('CPF já cadastrado', 400);
    }
  }

  const updated = await prisma.funcionario.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : undefined,
      dataUltimoExame: data.dataUltimoExame ? new Date(data.dataUltimoExame) : undefined,
    },
    include: {
      empresa: {
        select: {
          id: true,
          nomeFantasia: true,
        },
      },
    },
  });

  res.json({
    status: 'success',
    data: { funcionario: updated },
  });
}

export async function deleteFuncionario(req: Request, res: Response) {
  const { id } = req.params;

  const funcionario = await prisma.funcionario.findFirst({
    where: {
      id: parseInt(id),
      deletedAt: null,
    },
  });

  if (!funcionario) {
    throw new AppError('Funcionário não encontrado', 404);
  }

  // Soft delete
  await prisma.funcionario.update({
    where: { id: parseInt(id) },
    data: { deletedAt: new Date() },
  });

  res.json({
    status: 'success',
    message: 'Funcionário excluído com sucesso',
  });
}
