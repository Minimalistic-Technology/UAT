import { Router } from "express";
import {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from "../controllers/testimonial.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

// Authenticated routes
router.use(protect);

router.post("/", createTestimonial);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
