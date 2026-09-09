import { Router } from "express";
import {
  createOrder,
  verifyCashfreePayment,
  getMyPayments,
} from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema } from "../validations/payment.validation.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/create-order", validate(createOrderSchema), createOrder);

router.get("/my-payments", getMyPayments);

router.get("/:orderId/verify", verifyCashfreePayment);

export default router;
