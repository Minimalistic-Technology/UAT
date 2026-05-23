import express from 'express';
import { body } from 'express-validator';
import { createCompany, getCompanies, getCompany, getMyCompany, updateCompany, deleteCompany, } from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { GlobalRole } from '../models/User.model.js';
const router = express.Router();
export const createCompanyValidation = [
    // --- User/Owner Validation ---
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Owner first name is required'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Owner last name is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phone')
        .trim()
        .optional(),
    // --- Company Validation ---
    body('companyName')
        .trim()
        .notEmpty()
        .withMessage('Company name is required'),
    body('companyDescription')
        .trim()
        .notEmpty()
        .withMessage('Company description is required'),
    body('industry')
        .trim()
        .notEmpty()
        .withMessage('Industry is required'),
];
router.get('/', getCompanies);
router.get('/me', protect, authorize(GlobalRole.USER), getMyCompany); // only for employer
router.get('/:id', getCompany);
router.post('/', protect, authorize(GlobalRole.SUPER_ADMIN), // only super admins can create new companies
validate(createCompanyValidation), createCompany);
router.put('/me', protect, authorize(GlobalRole.USER), updateCompany); // only for employer
router.delete('/:id', protect, authorize(GlobalRole.USER), deleteCompany); // only for employer
export default router;
