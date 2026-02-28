import express from 'express';
import { createCoupon, getCoupons, deleteCoupon, validateCoupon, getCouponById, updateCoupon } from '../controllers/coupon.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Public route to validate
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', auth as any, checkPermission(['marketing']), createCoupon);
router.get('/', auth as any, checkPermission(['marketing', 'product_manager', 'order_manager', 'finance']), getCoupons);
router.get('/:id', auth as any, checkPermission(['marketing', 'product_manager', 'order_manager', 'finance']), getCouponById);
router.put('/:id', auth as any, checkPermission(['marketing']), updateCoupon);
router.delete('/:id', auth as any, checkPermission(['marketing']), deleteCoupon);

export default router;
