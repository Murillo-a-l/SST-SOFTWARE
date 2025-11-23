import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/catalogo-servicos - Listar todos os serviços
router.get('/', async (req, res) => {
    try {
        const servicos = await prisma.catalogoServico.findMany({
            orderBy: { nome: 'asc' },
            include: {
                _count: {
                    select: {
                        servicosPrestados: true,
                    },
                },
            },
        });

        res.json({ status: 'success', data: { servicos } });
    } catch (error) {
        console.error('Error fetching catálogo serviços:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar catálogo de serviços' });
    }
});

// GET /api/catalogo-servicos/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const servico = await prisma.catalogoServico.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: {
                        servicosPrestados: true,
                    },
                },
            },
        });

        if (!servico) {
            return res.status(404).json({ status: 'error', message: 'Serviço não encontrado' });
        }

        res.json({ status: 'success', data: { servico } });
    } catch (error) {
        console.error('Error fetching catálogo serviço:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar serviço' });
    }
});

// POST /api/catalogo-servicos - Criar novo serviço
router.post('/', async (req, res) => {
    try {
        const {
            codigoInterno,
            nome,
            tipo,
            precoPadrao,
            descricao,
            aliquotaISS,
            codigoServicoLC116,
            cnae
        } = req.body;

        // Validação básica
        if (!codigoInterno || !nome || !tipo || precoPadrao === undefined) {
            return res.status(400).json({
                message: 'Código interno, nome, tipo e preço padrão são obrigatórios'
            });
        }

        // Verificar se já existe código interno
        const servicoExistente = await prisma.catalogoServico.findUnique({
            where: { codigoInterno }
        });

        if (servicoExistente) {
            return res.status(400).json({
                message: 'Já existe um serviço com este código interno'
            });
        }

        const servico = await prisma.catalogoServico.create({
            data: {
                codigoInterno,
                nome,
                tipo,
                precoPadrao: new Decimal(precoPadrao),
                descricao: descricao || null,
                aliquotaISS: aliquotaISS ? new Decimal(aliquotaISS) : null,
                codigoServicoLC116: codigoServicoLC116 || null,
                cnae: cnae || null,
            },
            include: {
                _count: {
                    select: {
                        servicosPrestados: true,
                    },
                },
            },
        });

        res.status(201).json({ status: 'success', data: { servico } });
    } catch (error) {
        console.error('Error creating catálogo serviço:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao criar serviço' });
    }
});

// PUT /api/catalogo-servicos/:id - Atualizar serviço
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            codigoInterno,
            nome,
            tipo,
            precoPadrao,
            descricao,
            aliquotaISS,
            codigoServicoLC116,
            cnae
        } = req.body;

        // Verificar se serviço existe
        const servicoExistente = await prisma.catalogoServico.findUnique({
            where: { id: Number(id) }
        });

        if (!servicoExistente) {
            return res.status(404).json({ status: 'error', message: 'Serviço não encontrado' });
        }

        // Verificar se código interno já existe (se está mudando)
        if (codigoInterno && codigoInterno !== servicoExistente.codigoInterno) {
            const servicoComMesmoCodigo = await prisma.catalogoServico.findUnique({
                where: { codigoInterno }
            });

            if (servicoComMesmoCodigo) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Já existe um serviço com este código interno'
                });
            }
        }

        const servico = await prisma.catalogoServico.update({
            where: { id: Number(id) },
            data: {
                codigoInterno: codigoInterno || undefined,
                nome: nome || undefined,
                tipo: tipo || undefined,
                precoPadrao: precoPadrao !== undefined ? new Decimal(precoPadrao) : undefined,
                descricao: descricao !== undefined ? descricao : undefined,
                aliquotaISS: aliquotaISS !== undefined ? (aliquotaISS ? new Decimal(aliquotaISS) : null) : undefined,
                codigoServicoLC116: codigoServicoLC116 !== undefined ? codigoServicoLC116 : undefined,
                cnae: cnae !== undefined ? cnae : undefined,
            },
            include: {
                _count: {
                    select: {
                        servicosPrestados: true,
                    },
                },
            },
        });

        res.json({ status: 'success', data: { servico } });
    } catch (error) {
        console.error('Error updating catálogo serviço:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar serviço' });
    }
});

// DELETE /api/catalogo-servicos/:id - Deletar serviço
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se serviço existe
        const servico = await prisma.catalogoServico.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: {
                        servicosPrestados: true,
                    },
                },
            },
        });

        if (!servico) {
            return res.status(404).json({ status: 'error', message: 'Serviço não encontrado' });
        }

        // Verificar se tem serviços prestados usando este catálogo
        if (servico._count.servicosPrestados > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Não é possível excluir serviço com ${servico._count.servicosPrestados} prestação(ões) associada(s)`
            });
        }

        await prisma.catalogoServico.delete({
            where: { id: Number(id) },
        });

        res.json({ status: 'success', message: 'Serviço deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting catálogo serviço:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao deletar serviço' });
    }
});

export default router;
