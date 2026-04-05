import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

// router.post("/subscribe", protect, authorize(GlobalRole.USER));

// router.get("/my-status", protect, authorize(GlobalRole.USER));

// router.patch("/:id/cancel", protect, authorize(GlobalRole.SUPER_ADMIN));

export default router;
