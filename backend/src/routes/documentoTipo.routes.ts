import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/documento-tipos - Listar todos os tipos de documento
router.get('/', async (_req, res) => {
  try {
    const tipos = await prisma.documentoTipo.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });

    res.json({ status: 'success', data: { tipos } });
  } catch (error) {
    console.error('Error fetching documento tipos:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar tipos de documento' });
  }
});

// GET /api/documento-tipos/:id - Buscar tipo de documento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await prisma.documentoTipo.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });

    if (!tipo) {
      return res.status(404).json({ status: 'error', message: 'Tipo de documento não encontrado' });
    }

    res.json({ status: 'success', data: { tipo } });
  } catch (error) {
    console.error('Error fetching documento tipo:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar tipo de documento' });
  }
});

// POST /api/documento-tipos - Criar novo tipo de documento
router.post('/', async (req, res) => {
  try {
    const { nome, validadeMesesPadrao, alertaDias } = req.body;

    if (!nome) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome é obrigatório',
      });
    }

    const tipoExistente = await prisma.documentoTipo.findUnique({
      where: { nome },
    });

    if (tipoExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe um tipo de documento com este nome',
      });
    }

    const tipo = await prisma.documentoTipo.create({
      data: {
        nome,
        validadeMesesPadrao: validadeMesesPadrao ? Number(validadeMesesPadrao) : null,
        alertaDias: alertaDias ? Number(alertaDias) : 30,
      },
      include: {
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });

    res.status(201).json({ status: 'success', data: { tipo } });
  } catch (error) {
    console.error('Error creating documento tipo:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao criar tipo de documento' });
  }
});

// PUT /api/documento-tipos/:id - Atualizar tipo de documento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, validadeMesesPadrao, alertaDias } = req.body;

    const tipoExistente = await prisma.documentoTipo.findUnique({
      where: { id: Number(id) },
    });

    if (!tipoExistente) {
      return res.status(404).json({ status: 'error', message: 'Tipo de documento não encontrado' });
    }

    if (nome && nome !== tipoExistente.nome) {
      const tipoComMesmoNome = await prisma.documentoTipo.findUnique({
        where: { nome },
      });

      if (tipoComMesmoNome) {
        return res.status(400).json({
          status: 'error',
          message: 'Já existe um tipo de documento com este nome',
        });
      }
    }

    const tipo = await prisma.documentoTipo.update({
      where: { id: Number(id) },
      data: {
        nome: nome || undefined,
        validadeMesesPadrao:
          validadeMesesPadrao !== undefined
            ? validadeMesesPadrao
              ? Number(validadeMesesPadrao)
              : null
            : undefined,
        alertaDias: alertaDias ? Number(alertaDias) : undefined,
      },
      include: {
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });

    res.json({ status: 'success', data: { tipo } });
  } catch (error) {
    console.error('Error updating documento tipo:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao atualizar tipo de documento' });
  }
});

// DELETE /api/documento-tipos/:id - Deletar tipo de documento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tipo = await prisma.documentoTipo.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });

    if (!tipo) {
      return res.status(404).json({ status: 'error', message: 'Tipo de documento não encontrado' });
    }

    if (tipo._count.documentos > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Não é possível excluir tipo com ${tipo._count.documentos} documento(s) associado(s)`,
      });
    }

    await prisma.documentoTipo.delete({
      where: { id: Number(id) },
    });

    res.json({ status: 'success', message: 'Tipo de documento deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting documento tipo:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao deletar tipo de documento' });
  }
});

export default router;
