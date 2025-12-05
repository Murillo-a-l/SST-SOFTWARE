import { Router } from 'express';
import * as exameController from '../controllers/exame.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', exameController.getAllExames);
router.get('/:id', exameController.getExameById);
router.post('/', authorize('ADMIN'), exameController.createExame);
router.put('/:id', authorize('ADMIN'), exameController.updateExame);
router.delete('/:id', authorize('ADMIN'), exameController.deleteExame);

export default router;
