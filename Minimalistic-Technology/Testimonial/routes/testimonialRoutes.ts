import express from "express";
import {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/create", createTestimonial);
router.put("/update/:id", updateTestimonial);
router.delete("/delete/:id", deleteTestimonial);

export default router;
