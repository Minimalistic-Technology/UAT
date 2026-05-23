import { body } from "express-validator";

export const createCouponSchema = [
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
];

export const updateCouponSchema = [
  body("code")
    .optional()
    .notEmpty()
    .withMessage("Coupon code cannot be empty")
    .trim(),
  body("type")
    .optional()
    .toLowerCase()
    .isIn(["percentage", "amount"])
    .withMessage("Coupon type must be 'percentage' or 'amount'"),
  body("value")
    .optional()
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
];

export const validateCouponSchema = [
  body("code").notEmpty().withMessage("Coupon code is required").trim(),
  body("baseAmount")
    .isNumeric()
    .withMessage(
      "A valid baseAmount must be provided to calculate the discount",
    )
    .custom((value) => value >= 0)
    .withMessage("baseAmount cannot be negative"),
];

export const applyCouponSchema = [
  body("code").notEmpty().withMessage("Coupon code is required").trim(),
  body("baseAmount")
    .isNumeric()
    .withMessage(
      "A valid baseAmount must be provided to calculate the discount",
    )
    .custom((value) => value >= 0)
    .withMessage("baseAmount cannot be negative"),
];
