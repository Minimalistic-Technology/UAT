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
import { GlobalRole } from "../../generated/prisma/client.js";
import { createCompanySchema, deleteCompanySchema } from '../validations/company.validation.js';
import { logoUpload } from '../constants/index.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/me', protect, authorize(GlobalRole.USER), getMyCompany); // only for employer / hr
router.get('/:id', getCompany);

router.post(
    '/',
    protect,
    authorize(GlobalRole.SUPER_ADMIN), // only super admins can create new companies
    validate(createCompanySchema),
    createCompany
);

router.put('/me', protect, authorize(GlobalRole.USER), updateCompany); // only for company owner
router.put('/logo', protect, authorize(GlobalRole.USER), logoUpload.single('logo'), uploadCompanyLogo); // only for companyowner
router.delete('/:id', protect, authorize(GlobalRole.USER), validate(deleteCompanySchema), deleteCompany); // only for company owner

export default router;