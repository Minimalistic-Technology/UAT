import express from "express";
import {
  getGameConfig,
  startGameSession,
  flipQuestion,
  completeGame,
  fiftyFiftyLifeline,
} from "../controllers/gameController";
import { requireUserAuth } from "../middlewares/userAuthMiddleware";

const router = express.Router();

router.get("/config", requireUserAuth, getGameConfig);
router.get("/session", requireUserAuth, startGameSession);
router.post("/flip-question", requireUserAuth, flipQuestion);
router.post("/complete", requireUserAuth, completeGame);
router.post("/lifeline/50-50", requireUserAuth, fiftyFiftyLifeline);
export default router;
