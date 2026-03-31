import { Router } from "express";
import { createOrder } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/create-order",
  validate([
    body("amount").notEmpty().withMessage("Amount is required"),
    body("userId").notEmpty().withMessage("User ID is required"),
    body("internalOrderId").notEmpty().withMessage("Internal order ID is required"),
  ]),
  createOrder,
);

export default router;
