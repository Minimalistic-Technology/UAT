import { body, param } from "express-validator";
import { ApplicationStatus } from "../models/Application.model.js";

export const applyForJobSchema = [
  body("jobId")
    .notEmpty()
    .withMessage("Job ID is required")
    .isMongoId()
    .withMessage("Invalid Job ID"),
];

export const getJobApplicantsSchema = [
  param("jobId")
    .notEmpty()
    .withMessage("Job ID is required")
    .isMongoId()
    .withMessage("Invalid Job ID"),
];

export const getJobApplicationByIdSchema = [
  param("id").isMongoId().withMessage("Invalid Application ID"),
];

export const updateApplicationStatusSchema = [
  param("id")
    .notEmpty()
    .withMessage("Job ID is required")
    .isMongoId()
    .withMessage("Invalid Job ID"),
  body("status")
    .exists()
    .withMessage("Status is required")
    .bail()
    .isIn(Object.values(ApplicationStatus))
    .withMessage("Invalid application status"),
  body("note")
    .optional()
    .isString()
    .withMessage("Note must be a string")
    .trim(),
  body("interviewDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid interview date format"),
];

export const withdrawApplicationSchema = [
  param("id")
    .notEmpty()
    .withMessage("Application ID is required")
    .isMongoId()
    .withMessage("Invalid Application ID"),
];
