import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

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

// Função recursiva para deletar pasta e todo seu conteúdo
async function deletePastaRecursive(pastaId: number): Promise<void> {
    // Buscar todas as subpastas
    const subPastas = await prisma.pasta.findMany({
        where: {
            parentId: pastaId,
            deletedAt: null
        }
    });

    // Deletar recursivamente todas as subpastas
    for (const subPasta of subPastas) {
        await deletePastaRecursive(subPasta.id);
    }

    // Deletar todos os documentos da pasta
    await prisma.documentoEmpresa.updateMany({
        where: {
            pastaId: pastaId,
            deletedAt: null
        },
        data: {
            deletedAt: new Date()
        }
    });

    // Deletar a pasta
    await prisma.pasta.update({
        where: { id: pastaId },
        data: { deletedAt: new Date() }
    });
}

// DELETE /api/pastas/:id - Deletar pasta em cascata (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se pasta existe
        const pasta = await prisma.pasta.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!pasta) {
            return res.status(404).json({ message: 'Pasta não encontrada' });
        }

        // Deletar pasta e todo seu conteúdo recursivamente
        await deletePastaRecursive(Number(id));

        res.json({ message: 'Pasta e todo seu conteúdo foram deletados com sucesso' });
    } catch (error) {
        console.error('Error deleting pasta:', error);
        res.status(500).json({ message: 'Erro ao deletar pasta' });
    }
});

export default router;
