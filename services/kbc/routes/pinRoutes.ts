import { Router } from "express";
import { setPinConfig, getPinConfig, verifyPin, checkPinExists } from "../controllers/pinController";
import { requireAdminAuth } from "../middlewares/authMiddleware";

const router = Router();

// All routes require admin authentication
router.post("/config", requireAdminAuth, setPinConfig);  // Create or update PIN configuration
router.get("/config", requireAdminAuth, getPinConfig);   // Get current PIN configuration
router.post("/verify", requireAdminAuth, verifyPin);     // Verify entered PIN
router.get("/check", requireAdminAuth, checkPinExists);  // Check if PIN config exists

export default router;