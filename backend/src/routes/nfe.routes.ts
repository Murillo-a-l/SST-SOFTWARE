import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { authenticate } from '../middleware/auth';
import { IPMWebserviceClient } from '../services/nfse/ipmWebserviceClient';
import type { NFSeData } from '../services/nfse';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// Configuração do cliente NFSe a partir do banco de dados (com fallback para .env)
async function getNFSeClient() {
  // Tentar buscar configuração do banco de dados primeiro
  const config = await prisma.configuracaoNFSe.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' }
  });

  if (config) {
    // Usar configuração do banco de dados
    return new IPMWebserviceClient({
      login: config.login,
      senha: config.senha,
      cidade: config.cidade,
      urlWebservice: config.url,
      retornoXml: true
    });
  }

  // Fallback para variáveis de ambiente (retrocompatibilidade)
  const login = process.env.NFSE_IPM_LOGIN;
  const senha = process.env.NFSE_IPM_SENHA;
  const cidade = process.env.NFSE_IPM_CIDADE || '8055';
  const url = process.env.NFSE_IPM_URL || 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php';

  if (!login || !senha) {
    throw new Error(
      'Configurações de NFSe não encontradas. Configure através do sistema (Configurações > Configuração de NFS-e) ou defina NFSE_IPM_LOGIN e NFSE_IPM_SENHA no arquivo .env'
    );
  }

  return new IPMWebserviceClient({
    login,
    senha,
    cidade,
    urlWebservice: url,
    retornoXml: true
  });
}

// GET /api/nfes
router.get('/', async (req, res) => {
    try {
        const { empresaId, status } = req.query;
        const where: any = { deletedAt: null };
        if (empresaId) where.empresaId = Number(empresaId);
        if (status) where.status = status;

        const nfes = await prisma.nFe.findMany({
            where,
            orderBy: { dataEmissao: 'desc' },
            include: {
                empresa: { select: { id: true, nomeFantasia: true } },
                _count: { select: { servicosPrestados: true, cobrancas: true } },
            },
        });
        res.json({ status: 'success', data: { nfes } });
    } catch (error) {
        console.error('Error fetching NFes:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar NFes' });
    }
});

// GET /api/nfes/:id
router.get('/:id', async (req, res) => {
    try {
        const nfe = await prisma.nFe.findFirst({
            where: { id: Number(req.params.id), deletedAt: null },
            include: {
                empresa: true,
                servicosPrestados: { include: { servico: true } },
                cobrancas: true,
            },
        });
        if (!nfe) return res.status(404).json({ message: 'NFe não encontrada' });
        res.json({ nfe });
    } catch (error) {
        console.error('Error fetching NFe:', error);
        res.status(500).json({ message: 'Erro ao buscar NFe' });
    }
});

// POST /api/nfes
router.post('/', async (req, res) => {
    try {
        const { empresaId, numero, dataEmissao, valor, descricaoServicos, status, xml, pdf } = req.body;
        if (!empresaId || valor === undefined || !dataEmissao || !descricaoServicos) {
            return res.status(400).json({ message: 'Empresa, valor, data de emissão e descrição são obrigatórios' });
        }

        // Verificar se número já existe (se fornecido)
        if (numero) {
            const nfeExistente = await prisma.nFe.findUnique({ where: { numero } });
            if (nfeExistente) {
                return res.status(400).json({ message: 'Já existe uma NFe com este número' });
            }
        }

        const nfe = await prisma.nFe.create({
            data: {
                empresaId: Number(empresaId),
                numero: numero || null,
                dataEmissao: new Date(dataEmissao),
                valor: new Decimal(valor),
                descricaoServicos,
                status: status || 'EM_ELABORACAO',
                xml: xml || null,
                pdf: pdf || null,
            },
        });
        res.status(201).json({ nfe });
    } catch (error) {
        console.error('Error creating NFe:', error);
        res.status(500).json({ message: 'Erro ao criar NFe' });
    }
});

// PUT /api/nfes/:id
router.put('/:id', async (req, res) => {
    try {
        const exists = await prisma.nFe.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
        if (!exists) return res.status(404).json({ message: 'NFe não encontrada' });

        const { numero, dataEmissao, valor, descricaoServicos, status, xml, pdf } = req.body;

        // Verificar se número já existe (se mudando)
        if (numero && numero !== exists.numero) {
            const nfeComMesmoNumero = await prisma.nFe.findUnique({ where: { numero } });
            if (nfeComMesmoNumero) {
                return res.status(400).json({ message: 'Já existe uma NFe com este número' });
            }
        }

        const nfe = await prisma.nFe.update({
            where: { id: Number(req.params.id) },
            data: {
                numero: numero !== undefined ? numero : undefined,
                dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
                valor: valor !== undefined ? new Decimal(valor) : undefined,
                descricaoServicos: descricaoServicos || undefined,
                status: status || undefined,
                xml: xml !== undefined ? xml : undefined,
                pdf: pdf !== undefined ? pdf : undefined,
            },
        });
        res.json({ nfe });
    } catch (error) {
        console.error('Error updating NFe:', error);
        res.status(500).json({ message: 'Erro ao atualizar NFe' });
    }
});

// DELETE /api/nfes/:id
router.delete('/:id', async (req, res) => {
    try {
        const nfe = await prisma.nFe.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
        if (!nfe) return res.status(404).json({ message: 'NFe não encontrada' });

        await prisma.nFe.update({ where: { id: Number(req.params.id) }, data: { deletedAt: new Date() } });
        res.json({ message: 'NFe deletada com sucesso' });
    } catch (error) {
        console.error('Error deleting NFe:', error);
        res.status(500).json({ message: 'Erro ao deletar NFe' });
    }
});

// ========================================
// ROTAS DE INTEGRAÇÃO COM WEBSERVICE IPM
// ========================================

// POST /api/nfes/emitir - Emitir NFSe via webservice IPM
router.post('/emitir', async (req, res) => {
    try {
        const { empresaId, servicosPrestadosIds, observacao } = req.body;

        if (!empresaId) {
            return res.status(400).json({ message: 'Empresa é obrigatória' });
        }

        if (!servicosPrestadosIds || servicosPrestadosIds.length === 0) {
            return res.status(400).json({ message: 'Selecione pelo menos um serviço prestado' });
        }

        // Buscar dados da empresa
        const empresa = await prisma.empresa.findFirst({
            where: { id: Number(empresaId), deletedAt: null }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Empresa não encontrada' });
        }

        // Buscar serviços prestados
        const servicosPrestados = await prisma.servicoPrestado.findMany({
            where: {
                id: { in: servicosPrestadosIds.map((id: number) => Number(id)) },
                empresaId: Number(empresaId),
                deletedAt: null
            },
            include: {
                servico: true
            }
        });

        if (servicosPrestados.length === 0) {
            return res.status(404).json({ message: 'Nenhum serviço prestado encontrado' });
        }

        // Calcular valores
        const valorTotal = servicosPrestados.reduce(
            (acc: number, sp: any) => acc + Number(sp.valorCobrado),
            0
        );

        // Montar dados para NFSe
        const modoTeste = process.env.NFSE_IPM_MODO_TESTE === 'true';
        const dataHoje = new Date();
        const dataFormatada = `${String(dataHoje.getDate()).padStart(2, '0')}/${String(dataHoje.getMonth() + 1).padStart(2, '0')}/${dataHoje.getFullYear()}`;

        const nfseData: NFSeData = {
            identificador: `NFSE-${empresaId}-${Date.now()}`,
            nf: {
                dataFatoGerador: dataFormatada,
                valorTotal,
                valorDesconto: 0,
                observacao: observacao || ''
            },
            prestador: {
                cpfcnpj: process.env.NFSE_IPM_LOGIN || '',
                cidade: process.env.NFSE_IPM_CIDADE || '8055'
            },
            tomador: {
                tipo: empresa.cnpj.length === 14 ? 'J' : 'F',
                cpfcnpj: empresa.cnpj,
                nomeRazaoSocial: empresa.razaoSocial || empresa.nomeFantasia,
                sobrenomeNomeFantasia: empresa.nomeFantasia,
                logradouro: empresa.endereco || 'Não informado',
                numero: '',
                bairro: '',
                cidade: '8055', // Código TOM - TODO: buscar do cadastro da empresa
                uf: '',
                cep: '',
                email: empresa.contatoEmail || '',
                ddd: empresa.contatoTelefone?.substring(0, 2) || '',
                telefone: empresa.contatoTelefone?.substring(2) || ''
            },
            itens: servicosPrestados.map((sp: any) => ({
                tributaMunicipioPrestador: 1,
                codigoItemListaServico: sp.servico.codigoServicoLC116 || '107',
                descritivo: sp.servico.nome,
                aliquotaItemListaServico: Number(sp.servico.aliquotaISS) || 5,
                situacaoTributaria: 0, // Tributada Integralmente
                valorTributavel: Number(sp.valorCobrado),
                cnae: sp.servico.cnae || ''
            })),
            modoTeste
        };

        // Emitir NFSe
        const client = await getNFSeClient();
        const response = await client.emitirNFSe(nfseData);

        if (!response.sucesso) {
            return res.status(400).json({
                message: `Erro ao emitir NFSe: ${response.mensagem}`
            });
        }

        // Salvar NFSe no banco
        const nfe = await prisma.nFe.create({
            data: {
                empresaId: Number(empresaId),
                numero: response.numeroNfse || null,
                dataEmissao: dataHoje,
                valor: new Decimal(valorTotal),
                descricaoServicos: servicosPrestados.map((sp: any) => sp.servico.nome).join(', '),
                status: 'AUTORIZADA',
                xml: '', // TODO: armazenar XML gerado
                pdf: response.linkNfse || null
            }
        });

        // Vincular serviços prestados à NFe
        await prisma.servicoPrestado.updateMany({
            where: { id: { in: servicosPrestadosIds.map((id: number) => Number(id)) } },
            data: { nfeId: nfe.id }
        });

        res.status(201).json({
            message: 'NFSe emitida com sucesso!',
            nfe,
            response: {
                numero: response.numeroNfse,
                serie: response.serieNfse,
                data: response.dataNfse,
                hora: response.horaNfse,
                link: response.linkNfse,
                codigoVerificador: response.codVerificadorAutenticidade
            }
        });
    } catch (error: any) {
        console.error('Error emitting NFe:', error);
        res.status(500).json({
            message: error.message || 'Erro ao emitir NFe'
        });
    }
});

// GET /api/nfes/:numero/consultar - Consultar NFSe por número
router.get('/:numero/consultar', async (req, res) => {
    try {
        const { numero } = req.params;

        const client = await getNFSeClient();
        const nfse = await client.consultarNFSePorNumero(numero);

        res.json({ nfse });
    } catch (error: any) {
        console.error('Error consulting NFe:', error);
        res.status(500).json({
            message: error.message || 'Erro ao consultar NFe'
        });
    }
});

// GET /api/nfes/consultar-periodo - Consultar NFSe por período
router.get('/consultar-periodo', async (req, res) => {
    try {
        const { dataInicial, dataFinal } = req.query;

        if (!dataInicial || !dataFinal) {
            return res.status(400).json({
                message: 'Data inicial e final são obrigatórias'
            });
        }

        const client = await getNFSeClient();
        const nfses = await client.consultarNFSePorPeriodo(
            String(dataInicial),
            String(dataFinal)
        );

        res.json({ nfses });
    } catch (error: any) {
        console.error('Error consulting NFes by period:', error);
        res.status(500).json({
            message: error.message || 'Erro ao consultar NFes por período'
        });
    }
});

// POST /api/nfes/:id/cancelar - Cancelar NFSe
router.post('/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;
        const { motivoCancelamento } = req.body;

        if (!motivoCancelamento) {
            return res.status(400).json({
                message: 'Motivo do cancelamento é obrigatório'
            });
        }

        // Buscar NFe
        const nfe = await prisma.nFe.findFirst({
            where: { id: Number(id), deletedAt: null }
        });

        if (!nfe) {
            return res.status(404).json({ message: 'NFe não encontrada' });
        }

        if (!nfe.numero) {
            return res.status(400).json({
                message: 'NFe não possui número. Apenas NFes emitidas podem ser canceladas.'
            });
        }

        if (nfe.status === 'CANCELADA') {
            return res.status(400).json({ message: 'NFe já está cancelada' });
        }

        // Cancelar no webservice
        const client = await getNFSeClient();
        const response = await client.cancelarNFSe(nfe.numero, motivoCancelamento);

        if (!response.sucesso) {
            return res.status(400).json({
                message: `Erro ao cancelar NFSe: ${response.mensagem}`
            });
        }

        // Atualizar status no banco
        await prisma.nFe.update({
            where: { id: Number(id) },
            data: { status: 'CANCELADA' }
        });

        res.json({
            message: 'NFSe cancelada com sucesso!',
            response: {
                mensagem: response.mensagem,
                codigo: response.codigo
            }
        });
    } catch (error: any) {
        console.error('Error canceling NFe:', error);
        res.status(500).json({
            message: error.message || 'Erro ao cancelar NFe'
        });
    }
});

export default router;
