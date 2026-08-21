import express from "express";
import { getRecommendedJobs } from "../controllers/recommendation.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../../generated/prisma/client.js";

const router = express.Router();

router.get("/", protect, authorize(GlobalRole.USER), getRecommendedJobs);

export default router;
