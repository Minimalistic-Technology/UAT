import { body } from "express-validator";

export const updateUserStatusSchema = [
  body("isActive")
    .exists({ checkNull: true })
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be a boolean")
    .toBoolean(), // converts "true"/"false" → true/false
];

export const updateKycStatusSchema = [
  body("status")
    .exists({ checkNull: true })
    .withMessage("Status is required")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either 'approved' or 'rejected'"),
];
