import express from "express";
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  getAllCompanyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById,
  getMyApplicationStats,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  applyForJobSchema,
  getJobApplicantsSchema,
  getJobApplicationByIdSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from "../validations/application.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  applicationLimiter,
  validate(applyForJobSchema),
  applyForJob,
);

router.get(
  "/my-applications",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  getMyApplications,
);

router.get(
  "/my-stats",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  getMyApplicationStats,
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
  validate(getJobApplicantsSchema),
  getJobApplicants,
);

router.get(
  "/:id",
  protect,
  authorize(GlobalRole.USER),
  validate(getJobApplicationByIdSchema),
  getApplicationById,
);

router.put(
  "/:id/status",
  protect,
  authorize(GlobalRole.USER), // only for employer
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

router.delete(
  "/:id",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  validate(withdrawApplicationSchema),
  withdrawApplication,
);

export default router;
