import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/cobrancas
router.get('/', async (req, res) => {
    try {
        const { empresaId, status } = req.query;
        const where: any = { deletedAt: null };
        if (empresaId) where.empresaId = Number(empresaId);
        if (status) where.status = status;

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
        if (!cobranca) return res.status(404).json({ message: 'Cobrança não encontrada' });
        res.json({ cobranca });
    } catch (error) {
        console.error('Error fetching cobranca:', error);
        res.status(500).json({ message: 'Erro ao buscar cobrança' });
    }
});

// POST /api/cobrancas
router.post('/', async (req, res) => {
    try {
        const { empresaId, valorTotal, dataEmissao, dataVencimento, dataPagamento, status, valorDesconto, valorJuros, valorMulta, observacoes, servicosPrestadosIds } = req.body;
        if (!empresaId || valorTotal === undefined || !dataEmissao || !dataVencimento) {
            return res.status(400).json({ message: 'Empresa, valor total, data de emissão e vencimento são obrigatórios' });
        }

        const cobranca = await prisma.cobranca.create({
            data: {
                empresaId: Number(empresaId),
                valorTotal: new Prisma.Decimal(valorTotal),
                dataEmissao: new Date(dataEmissao),
                dataVencimento: new Date(dataVencimento),
                status: status || 'PENDENTE',
                desconto: valorDesconto ? new Prisma.Decimal(valorDesconto) : null,
                juros: valorJuros ? new Prisma.Decimal(valorJuros) : null,
                multa: valorMulta ? new Prisma.Decimal(valorMulta) : null,
                observacoes: observacoes || null,
            },
        });

        // Vincular serviços prestados à cobrança
        if (servicosPrestadosIds && Array.isArray(servicosPrestadosIds) && servicosPrestadosIds.length > 0) {
            await prisma.servicoPrestado.updateMany({
                where: { id: { in: servicosPrestadosIds.map((id: number) => Number(id)) } },
                data: { cobrancaId: cobranca.id }
            });
        }

        res.status(201).json({ cobranca });
    } catch (error) {
        console.error('Error creating cobranca:', error);
        res.status(500).json({ message: 'Erro ao criar cobrança' });
    }
});

// PUT /api/cobrancas/:id
router.put('/:id', async (req, res) => {
    try {
        const exists = await prisma.cobranca.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
        if (!exists) return res.status(404).json({ message: 'Cobrança não encontrada' });

        const { valorTotal, dataEmissao, dataVencimento, status, desconto, multa, juros, observacoes, nfeId } = req.body;
        const cobranca = await prisma.cobranca.update({
            where: { id: Number(req.params.id) },
            data: {
                valorTotal: valorTotal !== undefined ? new Prisma.Decimal(valorTotal) : undefined,
                dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
                dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
                status: status || undefined,
                desconto: desconto !== undefined ? (desconto ? new Prisma.Decimal(desconto) : null) : undefined,
                multa: multa !== undefined ? (multa ? new Prisma.Decimal(multa) : null) : undefined,
                juros: juros !== undefined ? (juros ? new Prisma.Decimal(juros) : null) : undefined,
                observacoes: observacoes !== undefined ? observacoes : undefined,
                nfeId: nfeId !== undefined ? (nfeId ? Number(nfeId) : null) : undefined,
            },
        });
        res.json({ cobranca });
    } catch (error) {
        console.error('Error updating cobranca:', error);
        res.status(500).json({ message: 'Erro ao atualizar cobrança' });
    }
});

// DELETE /api/cobrancas/:id
router.delete('/:id', async (req, res) => {
    try {
        const cobranca = await prisma.cobranca.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
        if (!cobranca) return res.status(404).json({ message: 'Cobrança não encontrada' });

        await prisma.cobranca.update({ where: { id: Number(req.params.id) }, data: { deletedAt: new Date() } });
        res.json({ message: 'Cobrança deletada com sucesso' });
    } catch (error) {
        console.error('Error deleting cobranca:', error);
        res.status(500).json({ message: 'Erro ao deletar cobrança' });
    }
});

export default router;
