import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPlan,
  getPlans,
  getAllAdminPlans,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { createPlanSchema, updatePlanSchema } from "../validations/plan.validation.js";

const router = Router();

// Public route to get active plans
router.get("/", getPlans);

// Protected routes for super admins
router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/admin", getAllAdminPlans); // This route will fetch all the plans (Inactive one's too)

router.post(
  "/",
  validate(createPlanSchema),
  createPlan,
);

router.put(
  "/:id",
  validate(updatePlanSchema),
  updatePlan,
);

router.delete("/:id", deletePlan);

export default router;
