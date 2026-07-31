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

export const verifyPaymentSchema = [
  body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
  body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
  body("razorpay_signature").notEmpty().withMessage("Signature is required"),
];
