import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validations/payment.validation.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post(
  "/create-order",
  validate(createOrderSchema),
  createOrder,
);

router.post(
  "/verify-payment",
  validate(verifyPaymentSchema),
  verifyPayment,
);

export default router;
