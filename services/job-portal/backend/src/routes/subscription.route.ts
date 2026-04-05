import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { validate } from "../middleware/validate.middleware.js";
import { param } from "express-validator";
import {
  getMyActiveSubscription,
  getMySubscriptionHistory,
  cancelMySubscription,
  getAllSubscriptions,
  adminAssignSubscription,
  updateSubscriptionStatus,
} from "../controllers/subscription.controller.js";

const router = Router();

router.get(
  "/my-status",
  protect,
  authorize(GlobalRole.USER),
  getMyActiveSubscription,
);
router.get(
  "/history",
  protect,
  authorize(GlobalRole.USER),
  getMySubscriptionHistory,
);
router.patch(
  "/:id/cancel",
  protect,
  authorize(GlobalRole.USER),
  validate([param("id")]),
  cancelMySubscription,
);

router.get(
  "/",
  protect,
  authorize(GlobalRole.SUPER_ADMIN),
  getAllSubscriptions,
);
router.post(
  "/admin/assign",
  protect,
  authorize(GlobalRole.SUPER_ADMIN),
  adminAssignSubscription,
);
router.patch(
  "/:id/status",
  protect,
  authorize(GlobalRole.SUPER_ADMIN),
  updateSubscriptionStatus,
);

export default router;
