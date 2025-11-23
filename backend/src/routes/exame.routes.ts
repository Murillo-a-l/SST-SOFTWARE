import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/exames - Listar todos os exames
router.get('/', async (req, res) => {
    try {
        const exames = await prisma.exameRealizado.findMany({
            where: { deletedAt: null },
            orderBy: { dataRealizacao: 'desc' },
        });

        res.json({ status: 'success', data: { exames } });
    } catch (error) {
        console.error('Error fetching exames:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar exames' });
    }
});

// GET /api/exames/:id - Buscar exame por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const exame = await prisma.exameRealizado.findFirst({
            where: {
                id: Number(id),
                deletedAt: null
            },
        });

        if (!exame) {
            return res.status(404).json({ message: 'Exame não encontrado' });
        }

        res.json({ status: 'success', data: { exame } });
    } catch (error) {
        console.error('Error fetching exame:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar exame' });
    }
});

// POST /api/exames - Criar novo exame
router.post('/', async (req, res) => {
    try {
        const {
            funcionarioId,
            tipoExame,
            dataRealizacao,
            dataVencimento,
            observacoes
        } = req.body;

        // Validação básica
        if (!funcionarioId || !tipoExame || !dataRealizacao) {
            return res.status(400).json({
                status: 'error',
                message: 'Funcionário, tipo de exame e data de realização são obrigatórios'
            });
        }

        // Verificar se funcionário existe
        const funcionario = await prisma.funcionario.findFirst({
            where: { id: Number(funcionarioId), deletedAt: null }
        });

        if (!funcionario) {
            return res.status(404).json({ status: 'error', message: 'Funcionário não encontrado' });
        }

        const exame = await prisma.exameRealizado.create({
            data: {
                funcionarioId: Number(funcionarioId),
                tipoExame,
                dataRealizacao: new Date(dataRealizacao),
                dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
                observacoes: observacoes || null,
            },
        });

        res.status(201).json({ status: 'success', data: { exame } });
    } catch (error) {
        console.error('Error creating exame:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao criar exame' });
    }
});

// PUT /api/exames/:id - Atualizar exame
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            funcionarioId,
            tipoExame,
            dataRealizacao,
            dataVencimento,
            observacoes
        } = req.body;

        // Verificar se exame existe
        const exameExistente = await prisma.exameRealizado.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!exameExistente) {
            return res.status(404).json({ status: 'error', message: 'Exame não encontrado' });
        }

        const exame = await prisma.exameRealizado.update({
            where: { id: Number(id) },
            data: {
                funcionarioId: funcionarioId ? Number(funcionarioId) : undefined,
                tipoExame: tipoExame || undefined,
                dataRealizacao: dataRealizacao ? new Date(dataRealizacao) : undefined,
                dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
                observacoes: observacoes !== undefined ? observacoes : undefined,
            },
        });

        res.json({ status: 'success', data: { exame } });
    } catch (error) {
        console.error('Error updating exame:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar exame' });
    }
});

// DELETE /api/exames/:id - Deletar exame (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se exame existe
        const exame = await prisma.exameRealizado.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!exame) {
            return res.status(404).json({ status: 'error', message: 'Exame não encontrado' });
        }

        await prisma.exameRealizado.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date() },
        });

        res.json({ status: 'success', message: 'Exame deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting exame:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao deletar exame' });
    }
});

export default router;
