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
import { body } from "express-validator";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/users", getAllUsers);
router.get("/jobs", getJobsByStatus);
router.put(
  "/users/:userId/toggle-status",
  validate([
    body("isActive")
      .exists({ checkNull: true })
      .withMessage("isActive is required")
      .isBoolean()
      .withMessage("isActive must be a boolean")
      .toBoolean(), // converts "true"/"false" → true/false
  ]),
  updateUserStatus,
);
router.get("/stats", getStats)

router.get("/kyc-applications", getKycApplications);
router.put(
  "/kyc-applications/:applicationId/status",
  validate([
    body("status")
      .exists({ checkNull: true })
      .withMessage("Status is required")
      .isIn(["approved", "rejected"])
      .withMessage("Status must be either 'approved' or 'rejected'"),
  ]),
  updateKycStatus
);

router.get("/analytics", getAdminAnalytics);


export default router;
