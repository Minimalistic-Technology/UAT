import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkFeature } from "../controllers/feature.controller.js";

const router = Router();

// Allow authenticated users to check their feature access
router.get("/:slug/check", protect, checkFeature);

export default router;
