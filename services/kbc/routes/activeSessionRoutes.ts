import express from "express";
import {
  startOrResumeSession,
  getActiveSession,
  updateSession,
  completeSession,
} from "../controllers/ActiveSessionController";
import { requireUserAuth } from "../middlewares/userAuthMiddleware";

const router = express.Router();

// 🟢 Start or resume an active game session
router.post("/start", requireUserAuth, startOrResumeSession);

// 🎯 Get current active session for logged-in user
router.get("/", requireUserAuth, getActiveSession);

// 🔄 Update session progress (e.g., next question, lifeline used)
router.put("/update", requireUserAuth, updateSession);

// 🏁 End or complete a session
router.put("/end", requireUserAuth, completeSession);

export default router;