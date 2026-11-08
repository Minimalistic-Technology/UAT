import express, { Request, Response, NextFunction } from 'express';
import {
    getSettings,
    updateSettings,
    uploadQuotationLogo,
    removeQuotationLogo,
    getSellerDetails,
    updateSellerDetails,
    resetSellerDetails
} from '../controllers/settingsController';
import { auth, checkGranularPermission } from '../middleware/auth.middleware';
import { uploadQuotationLogoMiddleware } from '../middleware/upload.middleware';

export const requireAdminOrSystemAdmin = (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    const role = req.user.role;
    const isDirectAdmin = role === 'admin' || role === 'super_admin';
    const hasGranularEdit = (req.user.editPages || []).includes('components') || (req.user.editPages || []).includes('billing');
    if (isDirectAdmin || hasGranularEdit) {
        return next();
    }
    return res.status(403).json({ msg: 'Access denied. Admin or System Admin authorization required.' });
};

const router = express.Router();

router.get('/', getSettings);
router.put('/', auth as any, checkGranularPermission('components', 'edit'), updateSettings);
router.post('/logo', auth as any, checkGranularPermission('components', 'edit'), uploadQuotationLogoMiddleware, uploadQuotationLogo);
router.delete('/logo', auth as any, checkGranularPermission('components', 'edit'), removeQuotationLogo);

// Seller Details CRUD Endpoints
router.get('/seller-details', getSellerDetails);
router.put('/seller-details', auth as any, requireAdminOrSystemAdmin, updateSellerDetails);
router.post('/seller-details', auth as any, requireAdminOrSystemAdmin, updateSellerDetails);
router.delete('/seller-details', auth as any, requireAdminOrSystemAdmin, resetSellerDetails);

export default router;
