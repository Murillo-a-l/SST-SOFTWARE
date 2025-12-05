import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { cargoService } from '../services/cargo.service';
import {
  createCargoSchema,
  updateCargoSchema,
  linkCargoRiscoSchema,
  linkCargoExameSchema,
  linkCargoAmbienteSchema,
} from '../validators/eso.validators';

export async function getAllCargos(req: Request, res: Response) {
  const { empresaId } = req.query;

  const where = empresaId ? { empresaId: String(empresaId) } : {};

  const cargos = await prisma.companyCargo.findMany({
    where,
    include: {
      empresa: true,
      _count: {
        select: {
          riscos: true,
          exames: true,
          ambientes: true,
          vinculos: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    status: 'success',
    data: { cargos },
  });
}

export async function getCargoById(req: Request, res: Response) {
  const { id } = req.params;

  const cargo = await cargoService.findWithRelations(id);

  if (!cargo) {
    throw new AppError('Cargo não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { cargo },
  });
}

export async function createCargo(req: Request, res: Response) {
  const validatedData = createCargoSchema.parse(req.body);

  // Valida se a empresa existe
  const empresa = await prisma.company.findUnique({
    where: { id: validatedData.empresaId },
  });

  if (!empresa) {
    throw new AppError('Empresa não encontrada', 404);
  }

  const cargo = await prisma.companyCargo.create({
    data: validatedData,
    include: {
      empresa: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { cargo },
  });
}

export async function updateCargo(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateCargoSchema.parse(req.body);

  const cargo = await prisma.companyCargo.update({
    where: { id },
    data: validatedData,
    include: {
      empresa: true,
    },
  });

  res.json({
    status: 'success',
    data: { cargo },
  });
}

export async function deleteCargo(req: Request, res: Response) {
  const { id } = req.params;

  // Valida se pode deletar
  const validation = await cargoService.canDelete(id);
  if (!validation.canDelete) {
    throw new AppError(validation.reason || 'Não é possível deletar este cargo', 400);
  }

  // Deleta com relações (cascade automático)
  await cargoService.deleteWithRelations(id);

  res.json({
    status: 'success',
    message: 'Cargo deletado com sucesso',
  });
}

// ============= ROTAS ESPECIAIS - RISCOS =============

export async function addRiscoToCargo(req: Request, res: Response) {
  const { id } = req.params;
  const { riscoId } = linkCargoRiscoSchema.parse(req.body);

  try {
    const link = await cargoService.addRisco(id, riscoId);

    res.status(201).json({
      status: 'success',
      data: { link },
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
}

export async function removeRiscoFromCargo(req: Request, res: Response) {
  const { id, riscoId } = req.params;

  await cargoService.removeRisco(id, riscoId);

  res.json({
    status: 'success',
    message: 'Risco removido do cargo com sucesso',
  });
}

// ============= ROTAS ESPECIAIS - EXAMES =============

export async function addExameToCargo(req: Request, res: Response) {
  const { id } = req.params;
  const { exameId } = linkCargoExameSchema.parse(req.body);

  try {
    const link = await cargoService.addExame(id, exameId);

    res.status(201).json({
      status: 'success',
      data: { link },
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
}

export async function removeExameFromCargo(req: Request, res: Response) {
  const { id, exameId } = req.params;

  await cargoService.removeExame(id, exameId);

  res.json({
    status: 'success',
    message: 'Exame removido do cargo com sucesso',
  });
}

// ============= ROTAS ESPECIAIS - AMBIENTES =============

export async function addAmbienteToCargo(req: Request, res: Response) {
  const { id } = req.params;
  const { ambienteId } = linkCargoAmbienteSchema.parse(req.body);

  try {
    const link = await cargoService.addAmbiente(id, ambienteId);

    res.status(201).json({
      status: 'success',
      data: { link },
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
}

export async function removeAmbienteFromCargo(req: Request, res: Response) {
  const { id, ambienteId } = req.params;

  await cargoService.removeAmbiente(id, ambienteId);

  res.json({
    status: 'success',
    message: 'Ambiente removido do cargo com sucesso',
  });
}
