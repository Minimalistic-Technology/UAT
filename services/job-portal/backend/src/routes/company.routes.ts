import express from 'express';
import { body } from 'express-validator';
import {
    createCompany,
    getCompanies,
    getCompany,
    getMyCompany,
    updateCompany,
    deleteCompany,
} from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { UserRole } from '../models/User.model.js';

const router = express.Router();

// Validation rules
const companyValidation = [
    body('name').trim().notEmpty().withMessage('Company name is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Company description is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
];

router.get('/', getCompanies);
router.get('/me', protect, authorize(UserRole.EMPLOYER), getMyCompany);
router.get('/:id', getCompany);

router.post(
    '/',
    protect,
    authorize(UserRole.EMPLOYER),
    validate(companyValidation),
    createCompany
);

router.put('/me', protect, authorize(UserRole.EMPLOYER), updateCompany);
router.delete('/:id', protect, authorize(UserRole.EMPLOYER), deleteCompany);

export default router;
