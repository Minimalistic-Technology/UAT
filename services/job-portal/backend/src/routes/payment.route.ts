import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validations/payment.validation.js";

const router = Router();

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
