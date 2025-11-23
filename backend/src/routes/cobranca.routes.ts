import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/cobrancas
router.get('/', async (req, res) => {
  try {
    const { empresaId, status } = req.query;
    const where: Prisma.CobrancaWhereInput = { deletedAt: null };
    if (empresaId) where.empresaId = Number(empresaId);
    if (status) where.status = String(status) as any;

    const cobrancas = await prisma.cobranca.findMany({
      where,
      orderBy: { dataEmissao: 'desc' },
      include: {
        empresa: { select: { id: true, nomeFantasia: true } },
        _count: { select: { servicosPrestados: true } },
      },
    });
    res.json({ status: 'success', data: { cobrancas } });
  } catch (error) {
    console.error('Error fetching cobrancas:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar cobranças' });
  }
});

// GET /api/cobrancas/:id
router.get('/:id', async (req, res) => {
  try {
    const cobranca = await prisma.cobranca.findFirst({
      where: { id: Number(req.params.id), deletedAt: null },
      include: { empresa: true, servicosPrestados: { include: { servico: true } }, nfe: true },
    });

    if (!cobranca) {
      return res.status(404).json({ status: 'error', message: 'Cobrança não encontrada' });
    }

    res.json({ status: 'success', data: { cobranca } });
  } catch (error) {
    console.error('Error fetching cobranca:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar cobrança' });
  }
});

// POST /api/cobrancas
router.post('/', async (req, res) => {
  try {
    const {
      empresaId,
      valorTotal,
      dataEmissao,
      dataVencimento,
      dataPagamento,
      status,
      valorDesconto,
      valorJuros,
      valorMulta,
      observacoes,
      servicosPrestadosIds,
    } = req.body;

    if (!empresaId || valorTotal === undefined || !dataEmissao || !dataVencimento) {
      return res.status(400).json({
        status: 'error',
        message: 'Empresa, valor total, data de emissão e vencimento são obrigatórios',
      });
    }

    const cobranca = await prisma.cobranca.create({
      data: {
        empresaId: Number(empresaId),
        valorTotal: new Decimal(valorTotal),
        dataEmissao: new Date(dataEmissao),
        dataVencimento: new Date(dataVencimento),
        status: (status || 'EMITIDA') as any,
        desconto: valorDesconto ? new Decimal(valorDesconto) : null,
        juros: valorJuros ? new Decimal(valorJuros) : null,
        multa: valorMulta ? new Decimal(valorMulta) : null,
        observacoes: observacoes || null,
      },
    });

    if (servicosPrestadosIds && Array.isArray(servicosPrestadosIds) && servicosPrestadosIds.length > 0) {
      await prisma.servicoPrestado.updateMany({
        where: { id: { in: servicosPrestadosIds.map((id: number) => Number(id)) } },
        data: { cobrancaId: cobranca.id },
      });
    }

    res.status(201).json({ status: 'success', data: { cobranca } });
  } catch (error) {
    console.error('Error creating cobranca:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao criar cobrança' });
  }
});

// PUT /api/cobrancas/:id
router.put('/:id', async (req, res) => {
  try {
    const exists = await prisma.cobranca.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!exists) {
      return res.status(404).json({ status: 'error', message: 'Cobrança não encontrada' });
    }

    const { valorTotal, dataEmissao, dataVencimento, status, desconto, multa, juros, observacoes, nfeId } = req.body;
    const cobranca = await prisma.cobranca.update({
      where: { id: Number(req.params.id) },
      data: {
        valorTotal: valorTotal !== undefined ? new Decimal(valorTotal) : undefined,
        dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
        dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
        status: status || undefined,
        desconto: desconto !== undefined ? (desconto ? new Decimal(desconto) : null) : undefined,
        multa: multa !== undefined ? (multa ? new Decimal(multa) : null) : undefined,
        juros: juros !== undefined ? (juros ? new Decimal(juros) : null) : undefined,
        observacoes: observacoes !== undefined ? observacoes : undefined,
        nfeId: nfeId !== undefined ? (nfeId ? Number(nfeId) : null) : undefined,
      },
    });
    res.json({ status: 'success', data: { cobranca } });
  } catch (error) {
    console.error('Error updating cobranca:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao atualizar cobrança' });
  }
});

// DELETE /api/cobrancas/:id
router.delete('/:id', async (req, res) => {
  try {
    const cobranca = await prisma.cobranca.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!cobranca) {
      return res.status(404).json({ status: 'error', message: 'Cobrança não encontrada' });
    }

    await prisma.cobranca.update({ where: { id: Number(req.params.id) }, data: { deletedAt: new Date() } });
    res.json({ status: 'success', message: 'Cobrança deletada com sucesso' });
  } catch (error) {
    console.error('Error deleting cobranca:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao deletar cobrança' });
  }
});

export default router;
