import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getMyActiveSubscription,
  getMySubscriptionHistory,
  cancelMySubscription,
  getAllSubscriptions,
  adminAssignSubscription,
  updateSubscriptionStatus,
} from "../controllers/subscription.controller.js";
import { cancelMySubscriptionSchema, updateMySubscriptionStatusSchema } from "../validations/subscription.validation.js";

const router = Router();

router.get(
  "/status",
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
  validate(cancelMySubscriptionSchema),
  cancelMySubscription,
);

// Super admmin routes
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
  validate(updateMySubscriptionStatusSchema),
  updateSubscriptionStatus,
);

export default router;
