import express from "express";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getRelatedJobs,
} from "../controllers/job.controller.js";
import {
  protect,
  authorize,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { createJobSchema, getJobByIdSchema } from "../validations/job.validation.js";

const router = express.Router();

router.get("/", optionalAuth, getJobs);
router.get("/my-jobs", protect, authorize(GlobalRole.USER), getMyJobs); // only for owner / hr
router.get("/:id/related", optionalAuth, getRelatedJobs);
router.get(
  "/:id",
  validate(getJobByIdSchema),
  getJob,
);
router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for owner / hr
  validate(createJobSchema),
  createJob,
);
router.patch("/:id", protect, authorize(GlobalRole.USER), updateJob); // only for employer / hr
router.delete("/:id", protect, authorize(GlobalRole.USER), deleteJob); // only for employer / hr

export default router;
