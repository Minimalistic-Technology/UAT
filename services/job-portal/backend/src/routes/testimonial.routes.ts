import { Router } from "express";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTestimonialValidator,
  updateTestimonialValidator,
} from "../validations/testimonial.validation.js";

const router = Router();

// Authenticated routes
router.use(protect);

router.post("/", validate(createTestimonialValidator), createTestimonial);
router.put("/:id", validate(updateTestimonialValidator), updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
