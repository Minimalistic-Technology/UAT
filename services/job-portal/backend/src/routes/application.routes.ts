import express from "express";
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  getAllCompanyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import { body, param } from "express-validator";
import { ApplicationStatus } from "../models/Application.model.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  applicationLimiter,
  validate([
    body("jobId")
      .notEmpty()
      .withMessage("Job ID is required")
      .isMongoId()
      .withMessage("Invalid Job ID"),
  ]),
  applyForJob,
);

router.get(
  "/my-applications",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  getMyApplications,
);

router.get(
  "/company/all",
  protect,
  authorize(GlobalRole.USER),
  getAllCompanyApplications,
);

router.get(
  "/job/:jobId",
  protect,
  authorize(GlobalRole.USER), // only for employer
  validate([
    param("jobId")
      .notEmpty()
      .withMessage("Job ID is required")
      .isMongoId()
      .withMessage("Invalid Job ID"),
  ]),
  getJobApplicants,
);

router.get(
  "/:id",
  protect,
  authorize(GlobalRole.USER),
  validate([param("id").isMongoId().withMessage("Invalid Application ID")]),
  getApplicationById,
);


router.put(
  "/:id/status",
  protect,
  authorize(GlobalRole.USER), // only for employer
  validate([
    param("id")
      .notEmpty()
      .withMessage("Job ID is required")
      .isMongoId()
      .withMessage("Invalid Job ID"),
  ]),
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
  updateApplicationStatus,
);

router.delete(
  "/:id",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  validate([
    param("id")
      .notEmpty()
      .withMessage("Application ID is required")
      .isMongoId()
      .withMessage("Invalid Application ID"),
  ]),
  withdrawApplication,
);

export default router;
