import { Router } from "express";
import {
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from "../controllers/testimonial.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

// Public routes
router.get("/", getTestimonials);

// Admin only routes
router.use(protect, authorize(GlobalRole.SUPER_ADMIN));

router.post("/", createTestimonial);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
