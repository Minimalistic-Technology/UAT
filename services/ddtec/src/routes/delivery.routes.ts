import { Router } from 'express';
import {
    checkPincodeServiceability,
    getDeliveryPartners,
    getPopularPincodes
} from '../controllers/delivery.controller';

const router = Router();

router.get('/check-pincode', checkPincodeServiceability);
router.get('/check/:pincode', checkPincodeServiceability);
router.post('/check-serviceability', checkPincodeServiceability);
router.get('/partners', getDeliveryPartners);
router.get('/pincodes/popular', getPopularPincodes);

export default router;
