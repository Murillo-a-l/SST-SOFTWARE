import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

/**
 * Converte uma string para Date de forma segura
 * Retorna null se a data for inválida ou não fornecida
 */
function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  // Verifica se a data é válida
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

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

    // Garantir formato ISO para evitar problemas de timezone
    const dataFimStr = documento.dataFim instanceof Date
        ? documento.dataFim.toISOString().split('T')[0]
        : String(documento.dataFim).split('T')[0];

    const dataFim = new Date(dataFimStr + 'T00:00:00');
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
            include: {
                tipo: true, // Include DocumentoTipo relation
            },
        });

        // Calcular status de cada documento
        const documentosComStatus = documentos.map((doc: any) => ({
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
            include: {
                tipo: true, // Include DocumentoTipo relation
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
                dataInicio: parseDate(dataInicio),
                dataFim: parseDate(dataFim),
                status: status || 'ATIVO',
                dadosSensiveis: dadosSensiveis || false,
                statusAssinatura: statusAssinatura || 'NAO_REQUER',
                requerAssinaturaDeId: requerAssinaturaDeId ? Number(requerAssinaturaDeId) : null,
                solicitadoPorId: solicitadoPorId ? Number(solicitadoPorId) : null,
                dataSolicitacaoAssinatura: parseDate(dataSolicitacaoAssinatura),
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
            arquivoAssinadoBase64,
            observacoes,
            temValidade,
            dataInicio,
            dataFim,
            status,
            dadosSensiveis,
            statusAssinatura,
            requerAssinaturaDeId,
            solicitadoPorId,
            dataConclusaoAssinatura,
            observacoesAssinatura
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
        const arquivoAssinado = arquivoAssinadoBase64;

        // Build update data object carefully
        const updateData: any = {};

        if (empresaId !== undefined) updateData.empresaId = Number(empresaId);
        if (pastaId !== undefined) updateData.pastaId = pastaId ? Number(pastaId) : null;
        if (finalTipoId !== undefined) updateData.tipoId = Number(finalTipoId);
        if (nome !== undefined) updateData.nome = nome;
        if (arquivo !== undefined) updateData.arquivoUrl = arquivo;
        if (arquivoAssinado !== undefined) updateData.arquivoAssinadoUrl = arquivoAssinado;
        if (observacoes !== undefined) updateData.observacoes = observacoes;
        if (temValidade !== undefined) updateData.temValidade = temValidade;
        if (dataInicio !== undefined) updateData.dataInicio = parseDate(dataInicio);
        if (dataFim !== undefined) updateData.dataFim = parseDate(dataFim);
        if (status !== undefined) updateData.status = status;
        if (dadosSensiveis !== undefined) updateData.dadosSensiveis = dadosSensiveis;
        if (statusAssinatura !== undefined) updateData.statusAssinatura = statusAssinatura;
        if (requerAssinaturaDeId !== undefined) updateData.requerAssinaturaDeId = requerAssinaturaDeId ? Number(requerAssinaturaDeId) : null;
        if (solicitadoPorId !== undefined) updateData.solicitadoPorId = solicitadoPorId ? Number(solicitadoPorId) : null;
        if (dataConclusaoAssinatura !== undefined) updateData.dataConclusaoAssinatura = parseDate(dataConclusaoAssinatura);
        if (observacoesAssinatura !== undefined) updateData.observacoesAssinatura = observacoesAssinatura;

        const documento = await prisma.documentoEmpresa.update({
            where: { id: Number(id) },
            data: updateData,
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

// POST /api/documentos/:id/assinar - Criar novo documento com assinatura (duplica o original)
router.post('/:id/assinar', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            arquivoAssinadoBase64,
            observacoesAssinatura,
            statusAssinatura
        } = req.body;

        console.log('=== DEBUG: ASSINAR DOCUMENTO ===');
        console.log('1. ID do documento:', id);
        console.log('2. Status de assinatura:', statusAssinatura);
        console.log('3. Tem arquivo assinado?:', !!arquivoAssinadoBase64);
        console.log('4. Tamanho do arquivo (bytes):', arquivoAssinadoBase64?.length || 0);

        // Validação básica
        if (!arquivoAssinadoBase64) {
            return res.status(400).json({ message: 'Arquivo assinado é obrigatório' });
        }

        // Buscar documento original
        const documentoOriginal = await prisma.documentoEmpresa.findFirst({
            where: { id: Number(id), deletedAt: null },
            include: { tipo: true }
        });

        if (!documentoOriginal) {
            return res.status(404).json({ message: 'Documento original não encontrado' });
        }

        console.log('5. Documento original encontrado:', documentoOriginal.nome);

        // Criar objeto de dados limpo, removendo campos undefined
        const dataToCreate: any = {
            empresaId: documentoOriginal.empresaId,
            tipoId: documentoOriginal.tipoId,
            nome: `${documentoOriginal.nome} - ASSINADO`,
            arquivoUrl: documentoOriginal.arquivoUrl, // Preserva o arquivo original
            arquivoAssinadoUrl: arquivoAssinadoBase64, // Adiciona o arquivo assinado
            temValidade: documentoOriginal.temValidade,
            status: documentoOriginal.status,
            dadosSensiveis: documentoOriginal.dadosSensiveis,
            statusAssinatura: statusAssinatura || 'ASSINADO',
            dataConclusaoAssinatura: new Date(),
        };

        // Adicionar campos opcionais apenas se existirem
        if (documentoOriginal.pastaId) dataToCreate.pastaId = documentoOriginal.pastaId;
        if (documentoOriginal.observacoes) dataToCreate.observacoes = documentoOriginal.observacoes;
        if (documentoOriginal.dataInicio) dataToCreate.dataInicio = documentoOriginal.dataInicio;
        if (documentoOriginal.dataFim) dataToCreate.dataFim = documentoOriginal.dataFim;
        if (documentoOriginal.requerAssinaturaDeId) dataToCreate.requerAssinaturaDeId = documentoOriginal.requerAssinaturaDeId;
        if (documentoOriginal.solicitadoPorId) dataToCreate.solicitadoPorId = documentoOriginal.solicitadoPorId;
        if (documentoOriginal.dataSolicitacaoAssinatura) dataToCreate.dataSolicitacaoAssinatura = documentoOriginal.dataSolicitacaoAssinatura;
        if (observacoesAssinatura) dataToCreate.observacoesAssinatura = observacoesAssinatura;

        console.log('6. Dados preparados para criar documento assinado:', {
            ...dataToCreate,
            arquivoUrl: `[${dataToCreate.arquivoUrl?.length || 0} bytes]`,
            arquivoAssinadoUrl: `[${dataToCreate.arquivoAssinadoUrl?.length || 0} bytes]`,
        });

        // Criar novo documento baseado no original com o arquivo assinado
        const novoDocumento = await prisma.documentoEmpresa.create({
            data: dataToCreate,
            include: { tipo: true }
        });

        console.log('7. Documento assinado criado com sucesso! ID:', novoDocumento.id);

        res.status(201).json({
            status: 'success',
            message: 'Documento assinado criado com sucesso',
            data: novoDocumento
        });
    } catch (error) {
        console.error('8. ERRO ao criar documento assinado:');
        console.error('Tipo do erro:', error?.constructor?.name);
        console.error('Mensagem:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
        console.error('Erro completo:', error);

        res.status(500).json({
            message: 'Erro ao criar documento assinado',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
