import { Router } from 'express';
import * as riscoController from '../controllers/risco.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', riscoController.getAllRiscos);
router.get('/:id', riscoController.getRiscoById);
router.post('/', authorize('ADMIN'), riscoController.createRisco);
router.put('/:id', authorize('ADMIN'), riscoController.updateRisco);
router.delete('/:id', authorize('ADMIN'), riscoController.deleteRisco);

export default router;
