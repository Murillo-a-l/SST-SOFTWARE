import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { companyService } from '../services/company.service';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../validators/eso.validators';

export async function getAllCompanies(req: Request, res: Response) {
  const companies = await prisma.company.findMany({
    include: {
      empresaMatriz: true,
      filiais: true,
      _count: {
        select: {
          cargos: true,
          ambientes: true,
          vinculos: true,
        },
      },
    },
    orderBy: { nomeFantasia: 'asc' },
  });

  res.json({
    status: 'success',
    data: { companies },
  });
}

export async function getCompanyById(req: Request, res: Response) {
  const { id } = req.params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      empresaMatriz: true,
      filiais: true,
      _count: {
        select: {
          cargos: true,
          ambientes: true,
          vinculos: true,
        },
      },
    },
  });

  if (!company) {
    throw new AppError('Empresa não encontrada', 404);
  }

  res.json({
    status: 'success',
    data: { company },
  });
}

export async function createCompany(req: Request, res: Response) {
  const validatedData = createCompanySchema.parse(req.body);

  // Valida CNPJ único
  const isCnpjUnique = await companyService.isCnpjUnique(validatedData.cnpj);
  if (!isCnpjUnique) {
    throw new AppError('CNPJ já cadastrado', 400);
  }

  // Se não é matriz, valida se a empresa matriz existe
  if (!validatedData.matriz && validatedData.empresaMatrizId) {
    const isMatrizValid = await companyService.validateMatriz(validatedData.empresaMatrizId);
    if (!isMatrizValid) {
      throw new AppError('Empresa matriz não encontrada ou inválida', 400);
    }
  }

  const company = await prisma.company.create({
    data: validatedData,
    include: {
      empresaMatriz: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { company },
  });
}

export async function updateCompany(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updateCompanySchema.parse(req.body);

  // Valida CNPJ único (excluindo o próprio registro)
  if (validatedData.cnpj) {
    const isCnpjUnique = await companyService.isCnpjUnique(validatedData.cnpj, id);
    if (!isCnpjUnique) {
      throw new AppError('CNPJ já cadastrado', 400);
    }
  }

  // Se mudou a matriz, valida
  if (validatedData.empresaMatrizId) {
    const isMatrizValid = await companyService.validateMatriz(validatedData.empresaMatrizId);
    if (!isMatrizValid) {
      throw new AppError('Empresa matriz não encontrada ou inválida', 400);
    }
  }

  const company = await prisma.company.update({
    where: { id },
    data: validatedData,
    include: {
      empresaMatriz: true,
    },
  });

  res.json({
    status: 'success',
    data: { company },
  });
}

export async function deleteCompany(req: Request, res: Response) {
  const { id } = req.params;

  // Valida se pode deletar
  const validation = await companyService.canDelete(id);
  if (!validation.canDelete) {
    throw new AppError(validation.reason || 'Não é possível deletar esta empresa', 400);
  }

  await prisma.company.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Empresa deletada com sucesso',
  });
}

// ============= ROTAS ESPECIAIS =============

export async function getCompanyFiliais(req: Request, res: Response) {
  const { id } = req.params;

  const filiais = await companyService.getFiliais(id);

  res.json({
    status: 'success',
    data: { filiais },
  });
}

export async function getCompanyCargos(req: Request, res: Response) {
  const { id } = req.params;

  const cargos = await companyService.getCargos(id);

  res.json({
    status: 'success',
    data: { cargos },
  });
}

export async function getCompanyAmbientes(req: Request, res: Response) {
  const { id } = req.params;

  const ambientes = await companyService.getAmbientes(id);

  res.json({
    status: 'success',
    data: { ambientes },
  });
}

export async function getCompanyPessoas(req: Request, res: Response) {
  const { id } = req.params;

  const pessoas = await companyService.getPessoas(id);

  res.json({
    status: 'success',
    data: { pessoas },
  });
}
