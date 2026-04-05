import express from "express";
import { body } from "express-validator";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from "../controllers/job.controller.js";
import {
  protect,
  authorize,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = express.Router();

// Validation rules
const jobValidation = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required"),
  body("jobType").notEmpty().withMessage("Job type is required"),
  body("experienceLevel")
    .notEmpty()
    .withMessage("Experience level is required"),
  body("openings").isInt({ min: 1 }).withMessage("Openings must be at least 1"),

  // arrays
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("skills.*").trim().notEmpty().withMessage("Skill cannot be empty"),
  body("requirements")
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),
  body("requirements.*")
    .trim()
    .notEmpty()
    .withMessage("Requirement cannot be empty"),

  body("benefits").optional().isArray(),

  // Dates and booleans
  body("applicationDeadline")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid deadline date"),
  body("isFeatured").optional().isBoolean(),

  // Salary Object
  body("salary.min")
    .optional()
    .isNumeric()
    .withMessage("Min salary must be a number"),
  body("salary.max")
    .optional()
    .isNumeric()
    .withMessage("Max salary must be a number")
    .custom((value, { req }) => {
      if (value && req.body.salary?.min && value < req.body.salary.min) {
        throw new Error("Max salary cannot be less than min salary");
      }
      return true;
    }),
  body("salary.currency").notEmpty().withMessage("Currency is required"),
  body("salary.period")
    .isIn(["hourly", "monthly", "yearly"])
    .withMessage("Invalid salary period"),

  // Location Object
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("location.state").trim().notEmpty().withMessage("State is required"),
  body("location.country").trim().notEmpty().withMessage("Country is required"),
  body("location.remote").isBoolean().withMessage("Remote must be a boolean"),
];

router.get("/", optionalAuth, getJobs);
router.get("/my-jobs", protect, authorize(GlobalRole.USER), getMyJobs); // only for employer
router.get("/:id", getJob);
router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for owner / admin
  validate(jobValidation),
  createJob,
);
router.patch("/:id", protect, authorize(GlobalRole.USER), updateJob); // only for employer
router.delete("/:id", protect, authorize(GlobalRole.USER), deleteJob); // only for employer

export default router;
