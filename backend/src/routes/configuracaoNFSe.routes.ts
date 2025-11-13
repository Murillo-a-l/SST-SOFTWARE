import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { IPMWebserviceClient } from '../services/nfse/ipmWebserviceClient';

const router = Router();
const prisma = new PrismaClient();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/configuracao-nfse
 * Busca a configuração ativa de NFS-e
 */
router.get('/', async (req, res) => {
  try {
    const configuracao = await prisma.configuracaoNFSe.findFirst({
      where: { ativo: true },
      orderBy: { createdAt: 'desc' }
    });

    // Não enviar a senha para o frontend por segurança
    if (configuracao) {
      const { senha, ...configSemSenha } = configuracao;
      res.json({
        status: 'success',
        data: {
          configuracao: {
            ...configSemSenha,
            senha: '********' // Máscara para indicar que tem senha configurada
          }
        }
      });
    } else {
      res.json({
        status: 'success',
        data: { configuracao: null }
      });
    }
  } catch (error: any) {
    console.error('Erro ao buscar configuração NFS-e:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar configuração de NFS-e'
    });
  }
});

/**
 * POST /api/configuracao-nfse
 * Cria ou atualiza a configuração de NFS-e
 */
router.post('/', async (req, res) => {
  try {
    const { login, senha, cidade, url, modoTeste } = req.body;

    // Validação básica
    if (!login || !senha || !cidade) {
      return res.status(400).json({
        status: 'error',
        message: 'Login, senha e código da cidade são obrigatórios'
      });
    }

    // Desativar configuração anterior
    await prisma.configuracaoNFSe.updateMany({
      where: { ativo: true },
      data: { ativo: false }
    });

    // Criar nova configuração
    const novaConfiguracao = await prisma.configuracaoNFSe.create({
      data: {
        login,
        senha,
        cidade,
        url: url || 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php',
        modoTeste: modoTeste !== undefined ? modoTeste : true,
        ativo: true
      }
    });

    // Não enviar a senha no response
    const { senha: _, ...configSemSenha } = novaConfiguracao;

    res.json({
      status: 'success',
      message: 'Configuração salva com sucesso',
      data: {
        configuracao: {
          ...configSemSenha,
          senha: '********'
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao salvar configuração NFS-e:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao salvar configuração de NFS-e'
    });
  }
});

/**
 * PUT /api/configuracao-nfse/:id
 * Atualiza configuração existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { login, senha, cidade, url, modoTeste, ativo } = req.body;

    const configAtual = await prisma.configuracaoNFSe.findUnique({
      where: { id: parseInt(id) }
    });

    if (!configAtual) {
      return res.status(404).json({
        status: 'error',
        message: 'Configuração não encontrada'
      });
    }

    // Se está ativando esta config, desativar as outras
    if (ativo === true) {
      await prisma.configuracaoNFSe.updateMany({
        where: {
          ativo: true,
          id: { not: parseInt(id) }
        },
        data: { ativo: false }
      });
    }

    // Atualizar configuração
    const configAtualizada = await prisma.configuracaoNFSe.update({
      where: { id: parseInt(id) },
      data: {
        ...(login && { login }),
        ...(senha && senha !== '********' && { senha }), // Só atualiza se não for a máscara
        ...(cidade && { cidade }),
        ...(url && { url }),
        ...(modoTeste !== undefined && { modoTeste }),
        ...(ativo !== undefined && { ativo })
      }
    });

    const { senha: _, ...configSemSenha } = configAtualizada;

    res.json({
      status: 'success',
      message: 'Configuração atualizada com sucesso',
      data: {
        configuracao: {
          ...configSemSenha,
          senha: '********'
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configuração NFS-e:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar configuração de NFS-e'
    });
  }
});

/**
 * POST /api/configuracao-nfse/testar
 * Testa a conexão com o webservice usando as credenciais fornecidas
 */
router.post('/testar', async (req, res) => {
  try {
    const { login, senha, cidade, url } = req.body;

    if (!login || !senha || !cidade) {
      return res.status(400).json({
        status: 'error',
        message: 'Login, senha e código da cidade são obrigatórios para o teste'
      });
    }

    // Criar cliente temporário
    const client = new IPMWebserviceClient({
      login,
      senha,
      cidade,
      urlWebservice: url || 'http://sync.nfs-e.net/datacenter/include/nfw/importa_nfw/nfw_import_upload.php',
      retornoXml: true
    });

    // Tentar fazer uma consulta simples para validar as credenciais
    // Vamos tentar consultar notas de um período muito antigo (que não deve ter nada)
    // Se der erro de autenticação, sabemos que as credenciais estão erradas
    // Se retornar vazio ou sucesso, as credenciais estão corretas
    try {
      await client.consultarNFSePorPeriodo('2000-01-01', '2000-01-02');

      res.json({
        status: 'success',
        message: 'Conexão estabelecida com sucesso! As credenciais estão corretas.',
        data: { testePassed: true }
      });
    } catch (error: any) {
      // Se o erro for de autenticação, as credenciais estão erradas
      if (error.message.includes('autenticação')) {
        res.status(401).json({
          status: 'error',
          message: 'Erro de autenticação. Verifique se o login, senha e código da cidade estão corretos.',
          data: { testePassed: false }
        });
      } else {
        // Outros erros podem ser de rede, etc, mas as credenciais podem estar corretas
        res.json({
          status: 'warning',
          message: `Não foi possível testar completamente a conexão: ${error.message}. As credenciais podem estar corretas, mas verifique a conectividade com o webservice.`,
          data: { testePassed: null }
        });
      }
    }
  } catch (error: any) {
    console.error('Erro ao testar configuração NFS-e:', error);
    res.status(500).json({
      status: 'error',
      message: `Erro ao testar conexão: ${error.message}`
    });
  }
});

/**
 * DELETE /api/configuracao-nfse/:id
 * Remove uma configuração
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.configuracaoNFSe.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Configuração removida com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao remover configuração NFS-e:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover configuração de NFS-e'
    });
  }
});

export default router;
