import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import {
  applyCoupon,
  createCoupon,
  getCoupons,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

// Protected routes for super admins
router.use(protect);

router.post(
  "/",
  authorize(GlobalRole.SUPER_ADMIN),
  validate([
    body("code").notEmpty().withMessage("Coupon code is required").trim(),
    body("type")
      .toLowerCase()
      .isIn(["percentage", "amount"])
      .withMessage("Coupon type must be 'percentage' or 'amount'"),
    body("value")
      .isNumeric()
      .withMessage("Coupon value must be a number")
      .custom((value) => value >= 0)
      .withMessage("Coupon value cannot be negative"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    body("expiryDate")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Invalid expiry date format"),
    body("maxUses")
      .optional()
      .isInt({ min: -1 })
      .withMessage("maxUses must be at least -1"),
  ]),
  createCoupon,
);

router.get("/", getCoupons);

router.post(
  "/apply",
  validate([
    body("code").notEmpty().withMessage("Coupon code is required").trim(),
    body("baseAmount")
      .isNumeric()
      .withMessage(
        "A valid baseAmount must be provided to calculate the discount",
      )
      .custom((value) => value >= 0)
      .withMessage("baseAmount cannot be negative"),
  ]),
  applyCoupon,
);

// validate coupon (without applying)
router.post(
  "/validate",
  validate([
    body("code").notEmpty().withMessage("Coupon code is required").trim(),
    body("baseAmount")
      .isNumeric()
      .withMessage(
        "A valid baseAmount must be provided to calculate the discount",
      )
      .custom((value) => value >= 0)
      .withMessage("baseAmount cannot be negative"),
  ]),
  validateCoupon,
);

export default router;
