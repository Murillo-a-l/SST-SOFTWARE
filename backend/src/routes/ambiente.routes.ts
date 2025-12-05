import { Router } from 'express';
import * as ambienteController from '../controllers/ambiente.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', ambienteController.getAllAmbientes);
router.get('/:id', ambienteController.getAmbienteById);
router.post('/', authorize('ADMIN'), ambienteController.createAmbiente);
router.put('/:id', authorize('ADMIN'), ambienteController.updateAmbiente);
router.delete('/:id', authorize('ADMIN'), ambienteController.deleteAmbiente);

export default router;
