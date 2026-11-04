import express from 'express';
import { getSettings, updateSettings, uploadQuotationLogo, removeQuotationLogo } from '../controllers/settingsController';
import { auth, checkGranularPermission } from '../middleware/auth.middleware';
import { uploadQuotationLogoMiddleware } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', getSettings);
router.put('/', auth as any, checkGranularPermission('components', 'edit'), updateSettings);
router.post('/logo', auth as any, checkGranularPermission('components', 'edit'), uploadQuotationLogoMiddleware, uploadQuotationLogo);
router.delete('/logo', auth as any, checkGranularPermission('components', 'edit'), removeQuotationLogo);

export default router;
