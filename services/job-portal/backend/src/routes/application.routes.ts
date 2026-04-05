import express from "express";
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  applicationLimiter,
  validate([
    body("jobId").isMongoId().withMessage("Valid jobId is required"),
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
  "/job/:jobId",
  protect,
  authorize(GlobalRole.USER), // only for employer
  getJobApplicants,
);

router.put(
  "/:id/status",
  protect,
  authorize(GlobalRole.USER), // only for employer
  updateApplicationStatus,
);

router.delete(
  "/:id",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  withdrawApplication,
);

export default router;
