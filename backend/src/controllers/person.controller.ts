import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { personService } from '../services/person.service';
import {
  createPersonSchema,
  updatePersonSchema,
} from '../validators/eso.validators';

export async function getAllPersons(req: Request, res: Response) {
  const persons = await prisma.person.findMany({
    include: {
      _count: {
        select: {
          vinculos: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });

  res.json({
    status: 'success',
    data: { persons },
  });
}

export async function getPersonById(req: Request, res: Response) {
  const { id } = req.params;

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      vinculos: {
        include: {
          empresa: true,
          cargo: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!person) {
    throw new AppError('Pessoa não encontrada', 404);
  }

  res.json({
    status: 'success',
    data: { person },
  });
}

export async function createPerson(req: Request, res: Response) {
  const validatedData = createPersonSchema.parse(req.body);

  // Valida CPF único
  const isCpfUnique = await personService.isCpfUnique(validatedData.cpf);
  if (!isCpfUnique) {
    throw new AppError('CPF já cadastrado', 400);
  }

  const person = await prisma.person.create({
    data: validatedData,
  });

  res.status(201).json({
    status: 'success',
    data: { person },
  });
}

export async function updatePerson(req: Request, res: Response) {
  const { id } = req.params;
  const validatedData = updatePersonSchema.parse(req.body);

  // Valida CPF único (excluindo o próprio registro)
  if (validatedData.cpf) {
    const isCpfUnique = await personService.isCpfUnique(validatedData.cpf, id);
    if (!isCpfUnique) {
      throw new AppError('CPF já cadastrado', 400);
    }
  }

  const person = await prisma.person.update({
    where: { id },
    data: validatedData,
  });

  res.json({
    status: 'success',
    data: { person },
  });
}

export async function deletePerson(req: Request, res: Response) {
  const { id } = req.params;

  // Verifica se tem vínculos ativos
  const hasActive = await personService.hasActiveVinculos(id);
  if (hasActive) {
    throw new AppError('Não é possível deletar pessoa com vínculos ativos', 400);
  }

  await prisma.person.delete({
    where: { id },
  });

  res.json({
    status: 'success',
    message: 'Pessoa deletada com sucesso',
  });
}

// ============= ROTAS ESPECIAIS =============

export async function getPersonVinculos(req: Request, res: Response) {
  const { id } = req.params;

  const vinculos = await personService.getVinculos(id);

  res.json({
    status: 'success',
    data: { vinculos },
  });
}
