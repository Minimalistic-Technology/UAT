import { body } from "express-validator";

export const createOrderSchema = [
  body("planId")
    .notEmpty()
    .withMessage("Plan ID is required")
    .isString()
    .withMessage("Invalid plan ID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isString()
    .withMessage("Invalid user ID"),
  body("internalOrderId")
    .notEmpty()
    .withMessage("Internal order ID is required"),
  body("couponCode").optional().isString(),
  body("billingCycle").optional().isString().isIn(["monthly", "yearly"]),
];
