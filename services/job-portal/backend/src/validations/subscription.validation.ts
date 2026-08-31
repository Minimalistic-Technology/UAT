import { param } from "express-validator";

export const cancelMySubscriptionSchema = [
  param("id")
    .notEmpty()
    .withMessage("Subscription ID is required")
    .isUUID()
    .withMessage("Invalid subscription ID"),
];

export const updateMySubscriptionStatusSchema = [
  param("id")
    .notEmpty()
    .withMessage("Subscription ID is required")
    .isUUID()
    .withMessage("Invalid subscription ID"),
];