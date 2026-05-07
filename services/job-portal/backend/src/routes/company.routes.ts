import express from 'express';
import {
    createCompany,
    getCompanies,
    getCompany,
    getMyCompany,
    updateCompany,
    deleteCompany,
    uploadCompanyLogo,
} from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { GlobalRole } from '../models/User.model.js';
import { createCompanySchema } from '../validations/company.validation.js';
import { logoUpload } from '../constants/index.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/me', protect, authorize(GlobalRole.USER), getMyCompany); // only for employer
router.get('/:id', getCompany);

router.post(
    '/',
    protect,
    authorize(GlobalRole.SUPER_ADMIN), // only super admins can create new companies
    validate(createCompanySchema),
    createCompany
);

router.put('/me', protect, authorize(GlobalRole.USER), updateCompany); // only for employer
router.put('/logo', protect, authorize(GlobalRole.USER), logoUpload.single('logo'), uploadCompanyLogo); // only for employer
router.delete('/:id', protect, authorize(GlobalRole.USER), deleteCompany); // only for employer

export default router;