import { Router } from 'express';
import {
    checkPincodeServiceability,
    getDeliveryPartners,
    getPopularPincodes,
    calculateCarrierRatesHandler
} from '../controllers/delivery.controller';

const router = Router();

// Check pincode serviceability (GET & POST)
router.get('/check-pincode', checkPincodeServiceability);
router.get('/check/:pincode', checkPincodeServiceability);
router.post('/check-serviceability', checkPincodeServiceability);

// Real-time B2B Carrier Freight Rate Calculator (GET & POST)
router.post('/calculate-rates', calculateCarrierRatesHandler);
router.get('/calculate-rates', calculateCarrierRatesHandler);

// Courier partners list
router.get('/partners', getDeliveryPartners);

// Popular test pincodes
router.get('/pincodes/popular', getPopularPincodes);

export default router;
