import { Router } from 'express';
import {
    checkPincodeServiceability,
    getDeliveryPartners,
    getPopularPincodes
} from '../controllers/delivery.controller';

const router = Router();

// Check pincode serviceability (GET & POST)
router.get('/check-pincode', checkPincodeServiceability);
router.get('/check/:pincode', checkPincodeServiceability);
router.post('/check-serviceability', checkPincodeServiceability);

// Courier partners list
router.get('/partners', getDeliveryPartners);

// Popular test pincodes
router.get('/pincodes/popular', getPopularPincodes);

export default router;
