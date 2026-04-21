import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/create-order",
  validate([
    body("planId").notEmpty().withMessage("Plan ID is required").isMongoId().withMessage("Invalid plan ID"),
    body("userId").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid user ID"),
    body("internalOrderId").notEmpty().withMessage("Internal order ID is required"),
    body("couponCode").optional().isString(),
  ]),
  createOrder,
);

router.post(
  "/verify-payment",
  validate([
    body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Signature is required"),
  ]),
  verifyPayment,
);

export default router;
