import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

/**
 * Calcula o status do documento com base na dataFim
 * Lógica: ATIVO, VENCENDO (30 dias antes), VENCIDO, ENCERRADO
 */
function calcularStatusDocumento(documento: any): string {
    // Se já foi encerrado manualmente, manter ENCERRADO
    if (documento.status === 'ENCERRADO') {
        return 'ENCERRADO';
    }

    // Se não tem validade, manter ATIVO
    if (!documento.temValidade || !documento.dataFim) {
        return 'ATIVO';
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataFim = new Date(documento.dataFim);
    dataFim.setHours(0, 0, 0, 0);

    // Calcular diferença em dias
    const diffTime = dataFim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'VENCIDO';
    } else if (diffDays <= 30) {
        return 'VENCENDO';
    } else {
        return 'ATIVO';
    }
}

// GET /api/documentos - Listar todos os documentos
router.get('/', async (req, res) => {
    try {
        const documentos = await prisma.documentoEmpresa.findMany({
            where: { deletedAt: null },
            orderBy: { dataUpload: 'desc' },
        });

        // Calcular status de cada documento
        const documentosComStatus = documentos.map(doc => ({
            ...doc,
            status: calcularStatusDocumento(doc)
        }));

        res.json({ status: 'success', data: documentosComStatus });
    } catch (error) {
        console.error('Error fetching documentos:', error);
        res.status(500).json({ message: 'Erro ao buscar documentos' });
    }
});

// GET /api/documentos/:id - Buscar documento por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await prisma.documentoEmpresa.findFirst({
            where: {
                id: Number(id),
                deletedAt: null
            },
        });

        if (!documento) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        // Calcular status automaticamente
        const documentoComStatus = {
            ...documento,
            status: calcularStatusDocumento(documento)
        };

        res.json({ status: 'success', data: documentoComStatus });
    } catch (error) {
        console.error('Error fetching documento:', error);
        res.status(500).json({ message: 'Erro ao buscar documento' });
    }
});

// POST /api/documentos - Criar novo documento
router.post('/', async (req, res) => {
    try {
        const {
            empresaId,
            pastaId,
            tipo,
            tipoId,
            nome,
            arquivoUrl,
            arquivoBase64,
            observacoes,
            temValidade,
            dataInicio,
            dataFim,
            status,
            dadosSensiveis,
            statusAssinatura,
            requerAssinaturaDeId,
            solicitadoPorId,
            dataSolicitacaoAssinatura
        } = req.body;

        // Accept either arquivoBase64 or arquivoUrl (base64 stored in arquivoUrl field temporarily)
        const arquivo = arquivoBase64 || arquivoUrl;

        // Validação básica
        if (!empresaId || !nome || !arquivo) {
            return res.status(400).json({
                message: 'Empresa, nome e arquivo são obrigatórios'
            });
        }

        // Handle both tipoId (number) and tipo (name string)
        let finalTipoId = tipoId;
        if (!finalTipoId && tipo) {
            // Find tipo by name
            const tipoDoc = await prisma.documentoTipo.findFirst({
                where: { nome: tipo }
            });
            if (!tipoDoc) {
                // Create new tipo if doesn't exist
                const newTipo = await prisma.documentoTipo.create({
                    data: {
                        nome: tipo,
                        alertaDias: 30,
                        validadeMesesPadrao: null
                    }
                });
                finalTipoId = newTipo.id;
            } else {
                finalTipoId = tipoDoc.id;
            }
        }

        if (!finalTipoId) {
            return res.status(400).json({ message: 'Tipo do documento é obrigatório' });
        }

        // Verificar se empresa existe
        const empresa = await prisma.empresa.findFirst({
            where: { id: Number(empresaId), deletedAt: null }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        const documento = await prisma.documentoEmpresa.create({
            data: {
                empresaId: Number(empresaId),
                pastaId: pastaId ? Number(pastaId) : null,
                tipoId: Number(finalTipoId),
                nome,
                arquivoUrl: arquivo, // Store base64 in arquivoUrl field temporarily
                observacoes: observacoes || null,
                temValidade: temValidade || false,
                dataInicio: dataInicio ? new Date(dataInicio) : null,
                dataFim: dataFim ? new Date(dataFim) : null,
                status: status || 'ATIVO',
                dadosSensiveis: dadosSensiveis || false,
                statusAssinatura: statusAssinatura || 'NAO_REQUER',
                requerAssinaturaDeId: requerAssinaturaDeId ? Number(requerAssinaturaDeId) : null,
                solicitadoPorId: solicitadoPorId ? Number(solicitadoPorId) : null,
                dataSolicitacaoAssinatura: dataSolicitacaoAssinatura ? new Date(dataSolicitacaoAssinatura) : null,
            },
        });

        res.status(201).json(documento);
    } catch (error) {
        console.error('Error creating documento:', error);
        res.status(500).json({ message: 'Erro ao criar documento' });
    }
});

// PUT /api/documentos/:id - Atualizar documento
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            empresaId,
            pastaId,
            tipo,
            tipoId,
            nome,
            arquivoUrl,
            arquivoBase64,
            observacoes,
            temValidade,
            dataInicio,
            dataFim,
            status,
            dadosSensiveis,
            statusAssinatura,
            requerAssinaturaDeId,
            solicitadoPorId
        } = req.body;

        // Verificar se documento existe
        const documentoExistente = await prisma.documentoEmpresa.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!documentoExistente) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        // Handle tipo name to tipoId conversion if needed
        let finalTipoId = tipoId;
        if (!finalTipoId && tipo) {
            const tipoDoc = await prisma.documentoTipo.findFirst({
                where: { nome: tipo }
            });
            if (!tipoDoc) {
                const newTipo = await prisma.documentoTipo.create({
                    data: {
                        nome: tipo,
                        alertaDias: 30,
                        validadeMesesPadrao: null
                    }
                });
                finalTipoId = newTipo.id;
            } else {
                finalTipoId = tipoDoc.id;
            }
        }

        // Handle arquivo (accept both base64 and url)
        const arquivo = arquivoBase64 || arquivoUrl;

        const documento = await prisma.documentoEmpresa.update({
            where: { id: Number(id) },
            data: {
                empresaId: empresaId ? Number(empresaId) : undefined,
                pastaId: pastaId !== undefined ? (pastaId ? Number(pastaId) : null) : undefined,
                tipoId: finalTipoId ? Number(finalTipoId) : undefined,
                nome: nome || undefined,
                arquivoUrl: arquivo || undefined,
                observacoes: observacoes !== undefined ? observacoes : undefined,
                temValidade: temValidade !== undefined ? temValidade : undefined,
                dataInicio: dataInicio !== undefined ? (dataInicio ? new Date(dataInicio) : null) : undefined,
                dataFim: dataFim !== undefined ? (dataFim ? new Date(dataFim) : null) : undefined,
                status: status || undefined,
                dadosSensiveis: dadosSensiveis !== undefined ? dadosSensiveis : undefined,
                statusAssinatura: statusAssinatura || undefined,
                requerAssinaturaDeId: requerAssinaturaDeId !== undefined ? (requerAssinaturaDeId ? Number(requerAssinaturaDeId) : null) : undefined,
                solicitadoPorId: solicitadoPorId !== undefined ? (solicitadoPorId ? Number(solicitadoPorId) : null) : undefined,
            },
        });

        res.json(documento);
    } catch (error) {
        console.error('Error updating documento:', error);
        res.status(500).json({ message: 'Erro ao atualizar documento' });
    }
});

// DELETE /api/documentos/:id - Deletar documento (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se documento existe
        const documento = await prisma.documentoEmpresa.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!documento) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        await prisma.documentoEmpresa.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date() },
        });

        res.json({ message: 'Documento deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting documento:', error);
        res.status(500).json({ message: 'Erro ao deletar documento' });
    }
});

export default router;
