import { Router } from 'express';
import * as cargoController from '../controllers/cargo.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', cargoController.getAllCargos);
router.get('/:id', cargoController.getCargoById);
router.post('/', authorize('ADMIN'), cargoController.createCargo);
router.put('/:id', authorize('ADMIN'), cargoController.updateCargo);
router.delete('/:id', authorize('ADMIN'), cargoController.deleteCargo);

// Rotas especiais - Riscos
router.post('/:id/riscos', authorize('ADMIN'), cargoController.addRiscoToCargo);
router.delete('/:id/riscos/:riscoId', authorize('ADMIN'), cargoController.removeRiscoFromCargo);

// Rotas especiais - Exames
router.post('/:id/exames', authorize('ADMIN'), cargoController.addExameToCargo);
router.delete('/:id/exames/:exameId', authorize('ADMIN'), cargoController.removeExameFromCargo);

// Rotas especiais - Ambientes
router.post('/:id/ambientes', authorize('ADMIN'), cargoController.addAmbienteToCargo);
router.delete('/:id/ambientes/:ambienteId', authorize('ADMIN'), cargoController.removeAmbienteFromCargo);

export default router;
