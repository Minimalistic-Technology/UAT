import { param } from "express-validator";

export const cancelMySubscriptionSchema = [
  param("id")
    .notEmpty()
    .withMessage("Subscription ID is required")
    .isMongoId()
    .withMessage("Invalid subscription ID"),
];

export const updateMySubscriptionStatusSchema = [
  param("id")
    .notEmpty()
    .withMessage("Subscription ID is required")
    .isMongoId()
    .withMessage("Invalid subscription ID"),
];