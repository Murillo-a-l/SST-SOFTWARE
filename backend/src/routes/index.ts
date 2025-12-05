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

// NOVO SISTEMA ESO - Estrutura Oficial
import companyRoutes from './company.routes';
import personRoutes from './person.routes';
import cargoRoutes from './cargo.routes';
import ambienteRoutes from './ambiente.routes';
import riscoRoutes from './risco.routes';
import globalExameRoutes from './globalExame.routes';
import vinculoRoutes from './vinculo.routes';

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

// NOVO SISTEMA ESO - Estrutura Oficial
router.use('/company', companyRoutes);
router.use('/person', personRoutes);
router.use('/cargo', cargoRoutes);
router.use('/ambiente', ambienteRoutes);
router.use('/risco', riscoRoutes);
router.use('/global-exame', globalExameRoutes);
router.use('/vinculo', vinculoRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
