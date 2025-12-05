import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD básico
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', authorize('ADMIN'), companyController.createCompany);
router.put('/:id', authorize('ADMIN'), companyController.updateCompany);
router.delete('/:id', authorize('ADMIN'), companyController.deleteCompany);

// Rotas especiais
router.get('/:id/filiais', companyController.getCompanyFiliais);
router.get('/:id/cargos', companyController.getCompanyCargos);
router.get('/:id/ambientes', companyController.getCompanyAmbientes);
router.get('/:id/pessoas', companyController.getCompanyPessoas);

export default router;
