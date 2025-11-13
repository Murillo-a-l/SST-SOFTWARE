import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// GET /api/pastas - Listar todas as pastas
router.get('/', async (req, res) => {
    try {
        const { empresaId } = req.query;

        const where: any = { deletedAt: null };
        if (empresaId) {
            where.empresaId = Number(empresaId);
        }

        const pastas = await prisma.pasta.findMany({
            where,
            orderBy: { nome: 'asc' },
            include: {
                _count: {
                    select: {
                        subPastas: true,
                        documentos: true,
                    },
                },
            },
        });

        res.json({ status: 'success', data: { pastas } });
    } catch (error) {
        console.error('Error fetching pastas:', error);
        res.status(500).json({ message: 'Erro ao buscar pastas' });
    }
});

// GET /api/pastas/:id - Buscar pasta por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pasta = await prisma.pasta.findFirst({
            where: {
                id: Number(id),
                deletedAt: null
            },
            include: {
                _count: {
                    select: {
                        subPastas: true,
                        documentos: true,
                    },
                },
            },
        });

        if (!pasta) {
            return res.status(404).json({ message: 'Pasta não encontrada' });
        }

        res.json({ pasta });
    } catch (error) {
        console.error('Error fetching pasta:', error);
        res.status(500).json({ message: 'Erro ao buscar pasta' });
    }
});

// POST /api/pastas - Criar nova pasta
router.post('/', async (req, res) => {
    try {
        const {
            empresaId,
            nome,
            parentId
        } = req.body;

        // Validação básica
        if (!empresaId || !nome) {
            return res.status(400).json({
                message: 'Empresa e nome são obrigatórios'
            });
        }

        // Verificar se empresa existe
        const empresa = await prisma.empresa.findFirst({
            where: { id: Number(empresaId), deletedAt: null }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        // Verificar se parentId existe (se fornecido)
        if (parentId) {
            const parentPasta = await prisma.pasta.findFirst({
                where: { id: Number(parentId), deletedAt: null }
            });

            if (!parentPasta) {
                return res.status(404).json({ message: 'Pasta pai não encontrada' });
            }
        }

        const pasta = await prisma.pasta.create({
            data: {
                empresaId: Number(empresaId),
                nome,
                parentId: parentId ? Number(parentId) : null,
            },
            include: {
                _count: {
                    select: {
                        subPastas: true,
                        documentos: true,
                    },
                },
            },
        });

        res.status(201).json({ pasta });
    } catch (error) {
        console.error('Error creating pasta:', error);
        res.status(500).json({ message: 'Erro ao criar pasta' });
    }
});

// PUT /api/pastas/:id - Atualizar pasta
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            parentId
        } = req.body;

        // Verificar se pasta existe
        const pastaExistente = await prisma.pasta.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!pastaExistente) {
            return res.status(404).json({ message: 'Pasta não encontrada' });
        }

        // Verificar se está tentando fazer parent de si mesma
        if (parentId && Number(parentId) === Number(id)) {
            return res.status(400).json({ message: 'Uma pasta não pode ser pai dela mesma' });
        }

        // Verificar se parentId existe (se fornecido)
        if (parentId) {
            const parentPasta = await prisma.pasta.findFirst({
                where: { id: Number(parentId), deletedAt: null }
            });

            if (!parentPasta) {
                return res.status(404).json({ message: 'Pasta pai não encontrada' });
            }
        }

        const pasta = await prisma.pasta.update({
            where: { id: Number(id) },
            data: {
                nome: nome || undefined,
                parentId: parentId !== undefined ? (parentId ? Number(parentId) : null) : undefined,
            },
            include: {
                _count: {
                    select: {
                        subPastas: true,
                        documentos: true,
                    },
                },
            },
        });

        res.json({ pasta });
    } catch (error) {
        console.error('Error updating pasta:', error);
        res.status(500).json({ message: 'Erro ao atualizar pasta' });
    }
});

// DELETE /api/pastas/:id - Deletar pasta (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se pasta existe
        const pasta = await prisma.pasta.findFirst({
            where: { id: Number(id), deletedAt: null },
            include: {
                _count: {
                    select: {
                        subPastas: true,
                        documentos: true,
                    },
                },
            },
        });

        if (!pasta) {
            return res.status(404).json({ message: 'Pasta não encontrada' });
        }

        // Verificar se tem subpastas ou documentos
        if (pasta._count.subPastas > 0 || pasta._count.documentos > 0) {
            return res.status(400).json({
                message: 'Não é possível excluir pasta com subpastas ou documentos. Mova-os primeiro.'
            });
        }

        await prisma.pasta.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date() },
        });

        res.json({ message: 'Pasta deletada com sucesso' });
    } catch (error) {
        console.error('Error deleting pasta:', error);
        res.status(500).json({ message: 'Erro ao deletar pasta' });
    }
});

export default router;
