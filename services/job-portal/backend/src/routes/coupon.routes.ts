import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  applyCoupon,
  createCoupon,
  getCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { applyCouponSchema, createCouponSchema, updateCouponSchema, validateCouponSchema } from "../validations/coupon.validation.js";

const router = Router();

router.use(protect);

router.get("/", getCoupons);

router.post(
  "/apply",
  validate(applyCouponSchema),
  applyCoupon,
);

// validate coupon (without applying)
router.post(
  "/validate",
  validate(validateCouponSchema),
  validateCoupon,
);

router.use(authorize(GlobalRole.SUPER_ADMIN));

router.post(
  "/",
  validate(createCouponSchema),
  createCoupon,
);

router.put(
  "/:id",
  validate(updateCouponSchema),
  updateCoupon,
);

router.delete("/:id", deleteCoupon);

export default router;
