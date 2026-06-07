import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { chatWithAi } from "../controllers/ai.controller.js";

const router = Router();

// Secure route to chat with AI (requires authentication)
// If you want it only for beta testers, we can wrap it in a feature check middleware later
router.post("/chat", protect, chatWithAi);

export default router;
