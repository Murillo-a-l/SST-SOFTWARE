import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { vinculoService } from '../services/vinculo.service';
import {
  createVinculoSchema,
  updateVinculoSchema,
  inativarVinculoSchema,
} from '../validators/eso.validators';

export async function getAllVinculos(req: Request, res: Response) {
  const { empresaId, personId, ativo } = req.query;

  const where: any = {};

  if (empresaId) where.empresaId = String(empresaId);
  if (personId) where.personId = String(personId);
  if (ativo !== undefined) where.ativo = ativo === 'true';

  const vinculos = await prisma.pessoaCargo.findMany({
    where,
    include: {
      person: true,
      empresa: true,
      cargo: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({
    status: 'success',
    data: { vinculos },
  });
}

export async function getVinculoById(req: Request, res: Response) {
  const { id } = req.params;

  const vinculo = await prisma.pessoaCargo.findUnique({
    where: { id },
    include: {
      person: true,
      empresa: true,
      cargo: true,
    },
  });

  if (!vinculo) {
    throw new AppError('Vínculo não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { vinculo },
  });
}

export async function createVinculo(req: Request, res: Response) {
  const validatedData = createVinculoSchema.parse(req.body);

  // Se está criando um vínculo ativo, valida se a pessoa já tem vínculo ativo na empresa
  if (validatedData.ativo !== false) {
    const validation = await vinculoService.canCreateActive(
      validatedData.personId,
      validatedData.empresaId
    );

    if (!validation.canCreate) {
      throw new AppError(validation.reason || 'Não é possível criar vínculo ativo', 400);
    }
  }

  // Valida se person existe
  const person = await prisma.person.findUnique({
    where: { id: validatedData.personId },
  });
  if (!person) {
    throw new AppError('Pessoa não encontrada', 404);
  }

  // Valida se empresa existe
  const empresa = await prisma.company.findUnique({
    where: { id: validatedData.empresaId },
  });
  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  // Valida se cargo existe e pertence à empresa
  const cargo = await prisma.companyCargo.findFirst({
    where: {
      id: validatedData.cargoId,
      empresaId: validatedData.empresaId,
    },
  });
  if (!cargo) {
    throw new AppError('Cargo não encontrado ou não pertence a esta empresa', 404);
  }

  const vinculo = await prisma.pessoaCargo.create({
    data: validatedData,
    include: {
      person: true,
      empresa: true,
      cargo: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { vinculo },
  });
}

export async function updateVinculo(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateVinculoSchema.parse(req.body);

  const vinculo = await prisma.pessoaCargo.update({
    where: { id },
    data: validatedData,
    include: {
      person: true,
      empresa: true,
      cargo: true,
    },
  });

  res.json({
    status: 'success',
    data: { vinculo },
  });
}

export async function deleteVinculo(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.pessoaCargo.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Vínculo deletado com sucesso',
  });
}

// ============= ROTAS ESPECIAIS =============

export async function inativarVinculo(req: Request, res: Response) {
  const { id } = req.params;
  const { dataSaida } = inativarVinculoSchema.parse(req.body);

  const vinculo = await vinculoService.inativar(
    id,
    dataSaida ? new Date(dataSaida) : undefined
  );

  res.json({
    status: 'success',
    data: { vinculo },
  });
}

export async function reativarVinculo(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const vinculo = await vinculoService.reativar(id);

    res.json({
      status: 'success',
      data: { vinculo },
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
}
