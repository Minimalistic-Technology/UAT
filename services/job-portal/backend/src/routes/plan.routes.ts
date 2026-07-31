import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../../generated/prisma/client.js";
import { createPlanSchema, updatePlanSchema } from "../validations/plan.validation.js";

const router = Router();

// Protected routes for super admins
router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

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
