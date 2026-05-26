import { body, query } from "express-validator";

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

export const getJobsByStatusSchema = [
  query("status")
    .exists({ checkNull: true })
    .withMessage("Status is required")
    .isIn(["active", "closed", "pending", "rejected"])
    .withMessage("Status must be either 'active', 'closed', 'pending', or 'rejected'")
];

export const getKycApplicationsSchema = [
  query("status")
    .exists({ checkNull: true })
    .withMessage("Status is required")
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Status must be either 'pending', 'approved', or 'rejected'")
];