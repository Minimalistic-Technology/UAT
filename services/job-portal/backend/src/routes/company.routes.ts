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
import { GlobalRole } from '../models/User.model.js';

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
router.get('/me', protect, authorize(GlobalRole.USER), getMyCompany); // only for employer
router.get('/:id', getCompany);

router.post(
    '/',
    protect,
    authorize(GlobalRole.USER), // only for employer
    validate(companyValidation),
    createCompany
);

router.put('/me', protect, authorize(GlobalRole.USER), updateCompany); // only for job employer
router.delete('/:id', protect, authorize(GlobalRole.USER), deleteCompany); // only for job employer

export default router;
