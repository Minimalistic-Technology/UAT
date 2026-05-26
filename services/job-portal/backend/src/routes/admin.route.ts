import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import {
  getAllUsers,
  getJobsByStatus,
  getStats,
  updateUserStatus,
  getKycApplications,
  getAdminAnalytics,
  updateKycStatus
} from "../controllers/admin.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateKycStatusSchema, updateUserStatusSchema, getJobsByStatusSchema } from "../validations/admin.validation.js";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/users", getAllUsers);
router.get("/jobs", validate(getJobsByStatusSchema), getJobsByStatus);
router.put(
  "/users/:userId/toggle-status",
  validate(updateUserStatusSchema),
  updateUserStatus,
);
router.get("/stats", getStats)

router.get("/kyc-applications", getKycApplications);
router.put(
  "/kyc-applications/:applicationId/status",
  validate(updateKycStatusSchema),
  updateKycStatus
);

router.get("/analytics", getAdminAnalytics);


export default router;