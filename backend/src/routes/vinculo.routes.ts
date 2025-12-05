import { Router } from 'express';
import * as vinculoController from '../controllers/vinculo.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', vinculoController.getAllVinculos);
router.get('/:id', vinculoController.getVinculoById);
router.post('/', authorize('ADMIN'), vinculoController.createVinculo);
router.put('/:id', authorize('ADMIN'), vinculoController.updateVinculo);
router.delete('/:id', authorize('ADMIN'), vinculoController.deleteVinculo);

// Rotas especiais
router.put('/:id/inativar', authorize('ADMIN'), vinculoController.inativarVinculo);
router.put('/:id/reativar', authorize('ADMIN'), vinculoController.reativarVinculo);

export default router;
