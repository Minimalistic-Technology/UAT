import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../../generated/prisma/client.js";
import {
  getAllUsers,
  getListingsByStatus,
  getStats,
  toggleUserStatus,
  getKycApplications,
  getAdminAnalytics,
  updateKycStatus,
} from "../controllers/admin.controller.js";
import { chatWithAi } from "../controllers/ai.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getKycApplicationsSchema,
  updateKycStatusSchema,
  getJobsByStatusSchema,
} from "../validations/admin.validation.js";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/users", getAllUsers);
router.get("/jobs", validate(getJobsByStatusSchema), getListingsByStatus);
router.put(
  "/users/:userId/toggle-status",
  toggleUserStatus,
);
router.get("/stats", getStats);

router.get(
  "/kyc-applications",
  validate(getKycApplicationsSchema),
  getKycApplications,
);
router.put(
  "/kyc-applications/:applicationId/status",
  validate(updateKycStatusSchema),
  updateKycStatus,
);

router.get("/analytics", getAdminAnalytics);

// AI Assistant Route
router.post("/chat", chatWithAi);

export default router;
