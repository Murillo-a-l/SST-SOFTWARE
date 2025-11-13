import { Router } from 'express';
import * as funcionarioController from '../controllers/funcionario.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', funcionarioController.getAllFuncionarios);
router.get('/:id', funcionarioController.getFuncionarioById);
router.post('/', funcionarioController.createFuncionario);
router.put('/:id', funcionarioController.updateFuncionario);
router.delete('/:id', funcionarioController.deleteFuncionario);

export default router;
