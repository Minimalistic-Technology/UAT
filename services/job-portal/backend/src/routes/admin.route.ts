import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/User.model.js";
import {
  getAllUsers,
  getJobsByStatus,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";

const router = Router();

router.use(protect);
router.use(authorize(UserRole.ADMIN));

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
export default router;
