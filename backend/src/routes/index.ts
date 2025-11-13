import { Router } from 'express';
import authRoutes from './auth.routes';
import empresaRoutes from './empresa.routes';
import funcionarioRoutes from './funcionario.routes';
import exameRoutes from './exame.routes';
import documentoRoutes from './documento.routes';
import pastaRoutes from './pasta.routes';
import documentoTipoRoutes from './documentoTipo.routes';
import catalogoServicoRoutes from './catalogoServico.routes';
import servicoPrestadoRoutes from './servicoPrestado.routes';
import cobrancaRoutes from './cobranca.routes';
import nfeRoutes from './nfe.routes';
import configuracaoNFSeRoutes from './configuracaoNFSe.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/exames', exameRoutes);
router.use('/documentos', documentoRoutes);
router.use('/pastas', pastaRoutes);
router.use('/documento-tipos', documentoTipoRoutes);
router.use('/catalogo-servicos', catalogoServicoRoutes);
router.use('/servicos-prestados', servicoPrestadoRoutes);
router.use('/cobrancas', cobrancaRoutes);
router.use('/nfes', nfeRoutes);
router.use('/configuracao-nfse', configuracaoNFSeRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
