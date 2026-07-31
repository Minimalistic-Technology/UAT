import express from 'express';
import { createCoupon, getCoupons, deleteCoupon, validateCoupon, getCouponById, updateCoupon, getActiveCoupons } from '../controllers/coupon.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

// Admin routes
router.post('/', auth as any, checkPermission(['marketing']), createCoupon);
router.get('/', auth as any, checkPermission(['marketing', 'product_manager', 'order_manager', 'finance']), getCoupons);
router.get('/:id', auth as any, checkPermission(['marketing', 'product_manager', 'order_manager', 'finance']), getCouponById);
router.put('/:id', auth as any, checkPermission(['marketing']), updateCoupon);
router.delete('/:id', auth as any, checkPermission(['marketing']), deleteCoupon);

export default router;
