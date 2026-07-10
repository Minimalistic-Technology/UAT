import { body, query } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const updateKycStatusSchema = [
  body("status")
    .exists({ checkNull: true })
    .withMessage("Status is required")
    .isString()
    .withMessage("Status must be a string")
    .isIn(["APPROVED", "REJECTED"])
    .withMessage("Status must be either 'approved' or 'rejected'"),
  body("note")
    .optional()
    .isString()
    .withMessage("Note must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Note must be between 10 and 500 characters"),
];

export const getJobsByStatusSchema = [
  query("status")
    .exists({ checkNull: true })
    .withMessage("Status is required")
    .custom((value) => {
      if (Array.isArray(value)) {
        throw new ApiError(400, "Status must be a single value");
      }
      return true;
    })
    .isString()
    .withMessage("Status must be a string")
    .isIn(["active", "closed", "pending", "rejected"])
    .withMessage(
      "Status must be either 'active', 'closed', 'pending', or 'rejected'",
    ),
];

export const getKycApplicationsSchema = [
  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Status must be either 'pending', 'approved', or 'rejected'"),
];
