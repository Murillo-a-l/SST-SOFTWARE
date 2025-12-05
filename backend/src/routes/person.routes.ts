import { Router } from 'express';
import * as personController from '../controllers/person.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', personController.getAllPersons);
router.get('/:id', personController.getPersonById);
router.post('/', authorize('ADMIN'), personController.createPerson);
router.put('/:id', authorize('ADMIN'), personController.updatePerson);
router.delete('/:id', authorize('ADMIN'), personController.deletePerson);

// Rotas especiais
router.get('/:id/vinculos', personController.getPersonVinculos);

export default router;
