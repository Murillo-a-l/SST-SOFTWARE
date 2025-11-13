import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/servicos-prestados
router.get('/', async (req, res) => {
    try {
        const { empresaId, status } = req.query;

        const where: any = { deletedAt: null };
        if (empresaId) where.empresaId = Number(empresaId);
        if (status) where.status = status;

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
                cobranca: true,
                nfe: true,
            },
        });

        if (!servico) {
            return res.status(404).json({ message: 'Serviço prestado não encontrado' });
        }

        res.json({ servico });
    } catch (error) {
        console.error('Error fetching serviço prestado:', error);
        res.status(500).json({ message: 'Erro ao buscar serviço prestado' });
    }
});

// POST /api/servicos-prestados
router.post('/', async (req, res) => {
    try {
        const { empresaId, servicoId, funcionarioId, dataRealizacao, valorCobrado, quantidade, descricaoAdicional, status } = req.body;

        if (!empresaId || !servicoId || !dataRealizacao || valorCobrado === undefined) {
            return res.status(400).json({ message: 'Empresa, serviço, data e valor são obrigatórios' });
        }

        const servico = await prisma.servicoPrestado.create({
            data: {
                empresaId: Number(empresaId),
                servicoId: Number(servicoId),
                funcionarioId: funcionarioId ? Number(funcionarioId) : null,
                dataRealizacao: new Date(dataRealizacao),
                valorCobrado: new Prisma.Decimal(valorCobrado),
                quantidade: quantidade || 1,
                descricaoAdicional: descricaoAdicional || null,
                status: status || 'PENDENTE',
            },
            include: {
                empresa: { select: { id: true, nomeFantasia: true } },
                servico: { select: { id: true, nome: true } },
            },
        });

        res.status(201).json({ servico });
    } catch (error) {
        console.error('Error creating serviço prestado:', error);
        res.status(500).json({ message: 'Erro ao criar serviço prestado' });
    }
});

// PUT /api/servicos-prestados/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { servicoId, funcionarioId, dataRealizacao, valorCobrado, quantidade, descricaoAdicional, status, cobrancaId, nfeId } = req.body;

        const exists = await prisma.servicoPrestado.findFirst({ where: { id: Number(id), deletedAt: null } });
        if (!exists) return res.status(404).json({ message: 'Serviço prestado não encontrado' });

        const servico = await prisma.servicoPrestado.update({
            where: { id: Number(id) },
            data: {
                servicoId: servicoId ? Number(servicoId) : undefined,
                funcionarioId: funcionarioId !== undefined ? (funcionarioId ? Number(funcionarioId) : null) : undefined,
                dataRealizacao: dataRealizacao ? new Date(dataRealizacao) : undefined,
                valorCobrado: valorCobrado !== undefined ? new Prisma.Decimal(valorCobrado) : undefined,
                quantidade: quantidade || undefined,
                descricaoAdicional: descricaoAdicional !== undefined ? descricaoAdicional : undefined,
                status: status || undefined,
                cobrancaId: cobrancaId !== undefined ? (cobrancaId ? Number(cobrancaId) : null) : undefined,
                nfeId: nfeId !== undefined ? (nfeId ? Number(nfeId) : null) : undefined,
            },
        });

        res.json({ servico });
    } catch (error) {
        console.error('Error updating serviço prestado:', error);
        res.status(500).json({ message: 'Erro ao atualizar serviço prestado' });
    }
});

// DELETE /api/servicos-prestados/:id
router.delete('/:id', async (req, res) => {
    try {
        const servico = await prisma.servicoPrestado.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
        if (!servico) return res.status(404).json({ message: 'Serviço prestado não encontrado' });

        await prisma.servicoPrestado.update({
            where: { id: Number(req.params.id) },
            data: { deletedAt: new Date() },
        });

        res.json({ message: 'Serviço prestado deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting serviço prestado:', error);
        res.status(500).json({ message: 'Erro ao deletar serviço prestado' });
    }
});

export default router;
