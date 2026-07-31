import express from "express";
import {
  createApplication,
  getMyApplications,
  getJobApplicants,
  getAllCompanyApplications,
  updateApplicationStatus,
  getApplicationById,
  getMyApplicationStats,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../../generated/prisma/client.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  applyForJobSchema,
  getJobApplicantsSchema,
  getJobApplicationByIdSchema,
  updateApplicationStatusSchema,
} from "../validations/application.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for job seeker
  applicationLimiter,
  validate(applyForJobSchema),
  createApplication,
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

router.post(
  "/jobs/my-applications",
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
  authorize(GlobalRole.USER), // only for owner / hr
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

export default router;
