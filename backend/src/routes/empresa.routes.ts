import { Router } from 'express';
import * as empresaController from '../controllers/empresa.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', empresaController.getAllEmpresas);
router.get('/:id', empresaController.getEmpresaById);
router.post('/', authorize('ADMIN'), empresaController.createEmpresa);
router.put('/:id', authorize('ADMIN'), empresaController.updateEmpresa);
router.delete('/:id', authorize('ADMIN'), empresaController.deleteEmpresa);

export default router;
