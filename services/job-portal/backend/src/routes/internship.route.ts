import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  authorize,
  optionalAuth,
  protect,
} from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import {
  getAllInternships,
  getInternshipById,
  getMyInternships,
  createInternship,
  deleteInternship,
  updateInternship,
} from "../controllers/internship.controller.js";
import {
  createInternshipSchema,
  getInternshipByIdSchema,
} from "../validations/internship.validations.js";

const router = express.Router();

router.get("/", optionalAuth, getAllInternships);
router.get("/my-jobs", protect, authorize(GlobalRole.USER), getMyInternships); // only for owner / hr
router.get("/:id", validate(getInternshipByIdSchema), getInternshipById);
router.post(
  "/",
  protect,
  authorize(GlobalRole.USER), // only for owner / admin
  validate(createInternshipSchema),
  createInternship,
);
router.patch("/:id", protect, authorize(GlobalRole.USER), updateInternship); // only for employer / hr
router.delete("/:id", protect, authorize(GlobalRole.USER), deleteInternship); // only for employer / hr

export default router;
