import { Router } from "express";
import { createOrder } from "../controllers/payment.controller.js";
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

export default router;
