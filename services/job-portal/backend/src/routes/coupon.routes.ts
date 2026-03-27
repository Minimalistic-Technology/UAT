import { Router } from "express";
import { createCoupon, getCoupons } from "../controllers/coupon.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

// Protected routes for super admins
router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.route("/")
  .post(createCoupon)
  .get(getCoupons);

export default router;
