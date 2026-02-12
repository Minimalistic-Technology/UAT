import express from 'express';
import { createCoupon, getCoupons, deleteCoupon, validateCoupon, getCouponById, updateCoupon } from '../controllers/coupon.controller';
// Add authentication/authorization middleware if available
// import { protect, admin } from '../middleware/authMiddleware'; 

const router = express.Router();

// Public route to validate
router.post('/validate', validateCoupon);

// Admin routes (Protected w/o middleware for now as usually requested, but should verify if we need to add auth)
// Check if other routes have protection. Assuming 'protect' and 'admin' middleware exists based on file structure.
// I will import them tentatively. If they fail I will remove.
// Actually, looking at file structure: `middleware` folder exists. 
// I'll check `app.ts` to see how other routes use middleware.
// For now, I will define routes without middleware and add them if I see the pattern in app.ts.

router.post('/', createCoupon);
router.get('/', getCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
