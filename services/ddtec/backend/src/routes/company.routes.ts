import { Router } from 'express';
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from '../controllers/company.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

const adminOnly = checkPermission(['admin', 'super_admin']);

// @route   GET /api/companies
router.get('/', auth, adminOnly, getCompanies);

// @route   POST /api/companies
router.post('/', auth, adminOnly, createCompany);

// @route   PUT /api/companies/:id
router.put('/:id', auth, adminOnly, updateCompany);

// @route   DELETE /api/companies/:id
router.delete('/:id', auth, adminOnly, deleteCompany);

export default router;
