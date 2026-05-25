import { body, param, query } from "express-validator";
import { ApplicationStatus } from "../models/Application.model.js";

export const applyForJobSchema = [
  body("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid Listing ID"),
  body("listingType")
    .notEmpty()
    .withMessage("Listing Type is required")
    .isIn(["job", "internship"])
    .withMessage("Invalid listing type"),
];

export const getAllCompanyApplicationsschema = [
  query("status")
    .optional()
    .isIn(Object.values(ApplicationStatus))
    .withMessage("Invalid application status"),
  query("listingType")
    .optional()
    .isIn(["job", "internship"])
    .withMessage("Invalid listing type"),
];

export const getJobApplicantsSchema = [
  body("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid Listing ID"),
  body("listingType")
    .notEmpty()
    .withMessage("Listing Type is required")
    .isIn(["job", "internship"])
    .withMessage("Invalid listing type"),
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
