import { Request, Response } from 'express';
import prisma from '../config/database';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Usuário e senha são obrigatórios', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      nome: true,
      username: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError('Credenciais inválidas', 401);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new AppError('Credenciais inválidas', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    status: 'success',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError('Não autenticado', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      nome: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json({
    status: 'success',
    data: { user },
  });
}

export async function logout(req: Request, res: Response) {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and can be extended for token blacklisting
  res.json({
    status: 'success',
    message: 'Logout realizado com sucesso',
  });
}
