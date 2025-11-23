import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { IPMWebserviceClient } from '../services/nfse/ipmWebserviceClient';
import type { NFSeData } from '../services/nfse';

const router = Router();
router.use(authenticate);

// Configuração do cliente NFSe a partir do banco de dados (com fallback para .env)
async function getNFSeClient() {
  const config = await prisma.configuracaoNFSe.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: 'desc' },
  });

  if (config) {
    return new IPMWebserviceClient({
      login: config.login,
      senha: config.senha,
      cidade: config.cidade,
      urlWebservice: config.url,
      retornoXml: true,
    });
  }

  const login = process.env.NFSE_IPM_LOGIN;
  const senha = process.env.NFSE_IPM_SENHA;
  const cidade = process.env.NFSE_IPM_CIDADE || '8055';
  const url = process.env.NFSE_IPM_URL || 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php';

  if (!login || !senha) {
    throw new Error(
      'Configurações de NFSe não encontradas. Configure pelo sistema (Configurações > Configuração de NFS-e) ou defina NFSE_IPM_LOGIN e NFSE_IPM_SENHA no .env'
    );
  }

  return new IPMWebserviceClient({
    login,
    senha,
    cidade,
    urlWebservice: url,
    retornoXml: true,
  });
}

// Helpers
const notFound = (res: any, message: string) => res.status(404).json({ status: 'error', message });
const badRequest = (res: any, message: string) => res.status(400).json({ status: 'error', message });
const serverError = (res: any, error: any, message: string) => {
  console.error(message, error);
  return res.status(500).json({ status: 'error', message: error?.message || message });
};

// GET /api/nfes
router.get('/', async (req, res) => {
  try {
    const { empresaId, status } = req.query;
    const where: Prisma.NFeWhereInput = { deletedAt: null };
    if (empresaId) where.empresaId = Number(empresaId);
    if (status) where.status = String(status) as any;

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
    serverError(res, error, 'Erro ao buscar NFes');
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
    if (!nfe) return notFound(res, 'NFe não encontrada');
    res.json({ status: 'success', data: { nfe } });
  } catch (error) {
    serverError(res, error, 'Erro ao buscar NFe');
  }
});

// POST /api/nfes
router.post('/', async (req, res) => {
  try {
    const { empresaId, numero, dataEmissao, valor, descricaoServicos, status, xml, pdf } = req.body;
    if (!empresaId || valor === undefined || !dataEmissao || !descricaoServicos) {
      return badRequest(res, 'Empresa, valor, data de emissão e descrição são obrigatórios');
    }

    if (numero) {
      const nfeExistente = await prisma.nFe.findUnique({ where: { numero } });
      if (nfeExistente) {
        return badRequest(res, 'Já existe uma NFe com este número');
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
    res.status(201).json({ status: 'success', data: { nfe } });
  } catch (error) {
    serverError(res, error, 'Erro ao criar NFe');
  }
});

// PUT /api/nfes/:id
router.put('/:id', async (req, res) => {
  try {
    const exists = await prisma.nFe.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!exists) return notFound(res, 'NFe não encontrada');

    const { numero, dataEmissao, valor, descricaoServicos, status, xml, pdf } = req.body;

    if (numero && numero !== exists.numero) {
      const nfeComMesmoNumero = await prisma.nFe.findUnique({ where: { numero } });
      if (nfeComMesmoNumero) {
        return badRequest(res, 'Já existe uma NFe com este número');
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
    res.json({ status: 'success', data: { nfe } });
  } catch (error) {
    serverError(res, error, 'Erro ao atualizar NFe');
  }
});

// DELETE /api/nfes/:id
router.delete('/:id', async (req, res) => {
  try {
    const nfe = await prisma.nFe.findFirst({ where: { id: Number(req.params.id), deletedAt: null } });
    if (!nfe) return notFound(res, 'NFe não encontrada');

    await prisma.nFe.update({ where: { id: Number(req.params.id) }, data: { deletedAt: new Date() } });
    res.json({ status: 'success', message: 'NFe deletada com sucesso' });
  } catch (error) {
    serverError(res, error, 'Erro ao deletar NFe');
  }
});

// POST /api/nfes/emitir - Emitir NFSe via webservice IPM
router.post('/emitir', async (req, res) => {
  try {
    const { empresaId, servicosPrestadosIds, observacao } = req.body;

    if (!empresaId) return badRequest(res, 'Empresa é obrigatória');
    if (!servicosPrestadosIds || servicosPrestadosIds.length === 0) {
      return badRequest(res, 'Selecione pelo menos um serviço prestado');
    }

    const empresa = await prisma.empresa.findFirst({
      where: { id: Number(empresaId), deletedAt: null },
    });
    if (!empresa) return notFound(res, 'Empresa não encontrada');

    const servicosPrestados = await prisma.servicoPrestado.findMany({
      where: {
        id: { in: servicosPrestadosIds.map((id: number) => Number(id)) },
        empresaId: Number(empresaId),
        deletedAt: null,
      },
      include: { servico: true },
    });

    if (servicosPrestados.length === 0) {
      return notFound(res, 'Nenhum serviço prestado encontrado');
    }

    const valorTotal = servicosPrestados.reduce(
      (sum, s) => sum + Number(s.valorCobrado || 0),
      0
    );

    const client = await getNFSeClient();
    const response = await client.emitirNFSe({
      servicos: servicosPrestados,
      observacao,
      valorTotal,
    } as any);

    const nfe = await prisma.nFe.create({
      data: {
        empresaId: Number(empresaId),
        numero: response.numeroNfse || null,
        dataEmissao: new Date(),
        valor: new Decimal(valorTotal),
        descricaoServicos: response.mensagem || 'Serviços prestados',
        status: (response.sucesso ? 'AUTORIZADA' : 'EM_ELABORACAO') as any,
        xml: (response as any).xml || null,
        pdf: null,
        servicosPrestados: {
          connect: servicosPrestados.map(s => ({ id: s.id })),
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        message: 'NFSe emitida com sucesso',
        nfe,
        response: {
          numero: response.numeroNfse,
          serie: response.serieNfse,
          data: response.dataNfse,
          hora: response.horaNfse,
          link: response.linkNfse,
          codigoVerificador: response.codVerificadorAutenticidade,
        },
      },
    });
  } catch (error: any) {
    serverError(res, error, 'Erro ao emitir NFe');
  }
});

// GET /api/nfes/consultar-periodo - Consultar NFSe por período
router.get('/consultar-periodo', async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    if (!dataInicial || !dataFinal) {
      return badRequest(res, 'Data inicial e final são obrigatórias');
    }

    const client = await getNFSeClient();
    const nfses = await client.consultarNFSePorPeriodo(
      String(dataInicial),
      String(dataFinal)
    );

    res.json({ status: 'success', data: { nfses } });
  } catch (error: any) {
    serverError(res, error, 'Erro ao consultar NFes por período');
  }
});

// GET /api/nfes/:numero/consultar - Consultar NFSe por número
router.get('/:numero/consultar', async (req, res) => {
  try {
    const { numero } = req.params;

    const client = await getNFSeClient();
    const nfse = await client.consultarNFSePorNumero(numero);

    res.json({ status: 'success', data: { nfse } });
  } catch (error: any) {
    serverError(res, error, 'Erro ao consultar NFe');
  }
});

// POST /api/nfes/:id/cancelar - Cancelar NFSe
router.post('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelamento } = req.body;

    if (!motivoCancelamento) {
      return badRequest(res, 'Motivo do cancelamento é obrigatório');
    }

    const nfe = await prisma.nFe.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!nfe) {
      return notFound(res, 'NFe não encontrada');
    }

    if (!nfe.numero) {
      return badRequest(res, 'NFe não possui número. Apenas NFes emitidas podem ser canceladas.');
    }

    if (nfe.status === 'CANCELADA') {
      return badRequest(res, 'NFe já está cancelada');
    }

    const client = await getNFSeClient();
    const response = await client.cancelarNFSe(nfe.numero, motivoCancelamento);

    if (!response.sucesso) {
      return badRequest(res, `Erro ao cancelar NFSe: ${response.mensagem}`);
    }

    await prisma.nFe.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADA' },
    });

    res.json({
      status: 'success',
      message: 'NFSe cancelada com sucesso!',
      data: {
        mensagem: response.mensagem,
        codigo: response.codigo,
      },
    });
  } catch (error: any) {
    serverError(res, error, 'Erro ao cancelar NFe');
  }
});

export default router;
