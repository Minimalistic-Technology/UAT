import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '../models/User.model.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize(UserRole.JOB_SEEKER),
  applicationLimiter,
  applyForJob
);
router.get(
  '/my-applications',
  protect,
  authorize(UserRole.JOB_SEEKER),
  getMyApplications
);
router.get(
  '/job/:jobId',
  protect,
  authorize(UserRole.EMPLOYER),
  getJobApplicants
);
router.put(
  '/:id/status',
  protect,
  authorize(UserRole.EMPLOYER),
  updateApplicationStatus
);
router.delete(
  '/:id',
  protect,
  authorize(UserRole.JOB_SEEKER),
  withdrawApplication
);

export default router;