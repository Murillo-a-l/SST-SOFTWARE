import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/servicos-prestados
router.get('/', async (req, res) => {
  try {
    const { empresaId, status } = req.query;

    const where: Prisma.ServicoPrestadoWhereInput = { deletedAt: null };
    if (empresaId) where.empresaId = Number(empresaId);
    if (status) where.status = String(status) as any;

    const servicos = await prisma.servicoPrestado.findMany({
      where,
      orderBy: { dataRealizacao: 'desc' },
      include: {
        empresa: { select: { id: true, nomeFantasia: true } },
        servico: { select: { id: true, nome: true, codigoInterno: true } },
        funcionario: { select: { id: true, nome: true } },
      },
    });

    res.json({ status: 'success', data: { servicos } });
  } catch (error) {
    console.error('Error fetching serviços prestados:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar serviços prestados' });
  }
});

// GET /api/servicos-prestados/:id
router.get('/:id', async (req, res) => {
  try {
    const servico = await prisma.servicoPrestado.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
      include: {
        empresa: true,
        servico: true,
        funcionario: true,
      },
    });

    if (!servico) {
      return res.status(404).json({ status: 'error', message: 'Serviço prestado não encontrado' });
    }

    res.json({ status: 'success', data: { servico } });
  } catch (error) {
    console.error('Error fetching serviço prestado:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar serviço prestado' });
  }
});

// POST /api/servicos-prestados
router.post('/', async (req, res) => {
  try {
    const { empresaId, servicoId, funcionarioId, dataRealizacao, valorCobrado, quantidade, descricaoAdicional, status, cobrancaId } = req.body;

    if (!empresaId || !servicoId || !dataRealizacao || valorCobrado === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Empresa, serviço, data de realização e valor são obrigatórios',
      });
    }

    const servico = await prisma.servicoPrestado.create({
      data: {
        empresaId: Number(empresaId),
        servicoId: Number(servicoId),
        funcionarioId: funcionarioId ? Number(funcionarioId) : null,
        dataRealizacao: new Date(dataRealizacao),
        valorCobrado: new Decimal(valorCobrado),
        quantidade: quantidade || 1,
        descricaoAdicional: descricaoAdicional || null,
        status: status || 'PENDENTE',
        cobrancaId: cobrancaId ? Number(cobrancaId) : null,
      },
      include: {
        empresa: { select: { id: true, nomeFantasia: true } },
        servico: { select: { id: true, nome: true, codigoInterno: true } },
        funcionario: { select: { id: true, nome: true } },
      },
    });

    res.status(201).json({ status: 'success', data: { servico } });
  } catch (error) {
    console.error('Error creating serviço prestado:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao criar serviço prestado' });
  }
});

// PUT /api/servicos-prestados/:id
router.put('/:id', async (req, res) => {
  try {
    const exists = await prisma.servicoPrestado.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!exists) {
      return res.status(404).json({ status: 'error', message: 'Serviço prestado não encontrado' });
    }

    const { servicoId, funcionarioId, dataRealizacao, valorCobrado, quantidade, descricaoAdicional, status, cobrancaId, nfeId } = req.body;
    const servico = await prisma.servicoPrestado.update({
      where: { id: Number(req.params.id) },
      data: {
        servicoId: servicoId ? Number(servicoId) : undefined,
        funcionarioId: funcionarioId !== undefined ? (funcionarioId ? Number(funcionarioId) : null) : undefined,
        dataRealizacao: dataRealizacao ? new Date(dataRealizacao) : undefined,
        valorCobrado: valorCobrado !== undefined ? new Decimal(valorCobrado) : undefined,
        quantidade: quantidade || undefined,
        descricaoAdicional: descricaoAdicional !== undefined ? descricaoAdicional : undefined,
        status: status || undefined,
        cobrancaId: cobrancaId !== undefined ? (cobrancaId ? Number(cobrancaId) : null) : undefined,
        nfeId: nfeId !== undefined ? (nfeId ? Number(nfeId) : null) : undefined,
      },
    });

    res.json({ status: 'success', data: { servico } });
  } catch (error) {
    console.error('Error updating serviço prestado:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao atualizar serviço prestado' });
  }
});

// DELETE /api/servicos-prestados/:id
router.delete('/:id', async (req, res) => {
  try {
    const servico = await prisma.servicoPrestado.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!servico) {
      return res.status(404).json({ status: 'error', message: 'Serviço prestado não encontrado' });
    }

    await prisma.servicoPrestado.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date() },
    });

    res.json({ status: 'success', message: 'Serviço prestado deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting serviço prestado:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao deletar serviço prestado' });
  }
});

export default router;
