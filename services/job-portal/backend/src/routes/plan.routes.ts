import { Router } from "express";
import { body } from "express-validator";
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

const router = Router();

// Public route to get active plans
router.get("/", getPlans);

// Protected routes for super admins
router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/admin", getAllAdminPlans); // This route will fetch all the plans (Inactive one's too)

router.post(
  "/",
  validate([
    body("name").notEmpty().withMessage("Plan name is required"),
    body("price")
      .isNumeric()
      .withMessage("Price is required and must be a number"),
    body("currency")
      .optional()
      .isString()
      .isIn(["INR", "USD", "EUR", "GBP"])
      .withMessage("Invalid currency"),
    body("durationDays")
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    body("jobPostLimit")
      .isInt({ min: -1 })
      .withMessage("Job post limit is required (-1 for unlimited)"),
  ]),
  createPlan,
);

router.put(
  "/:id",
  validate([
    body("name").optional().notEmpty().withMessage("Plan name cannot be empty"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("currency")
      .optional()
      .isString()
      .isIn(["INR", "USD", "EUR", "GBP"])
      .withMessage("Invalid currency"),
    body("durationDays")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    body("jobPostLimit")
      .optional()
      .isInt({ min: -1 })
      .withMessage("Job post limit must be at least -1"),
  ]),
  updatePlan,
);

router.delete("/:id", deletePlan);

export default router;
