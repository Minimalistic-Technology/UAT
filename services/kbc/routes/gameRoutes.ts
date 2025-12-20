import express from "express";
import {
  getGameConfig,
  startGameSession,
  flipQuestion,
  completeGame,
} from "../controllers/gameController";

const router = express.Router();

router.get("/config", getGameConfig);
router.get("/session", startGameSession);
router.post("/flip-question", flipQuestion);
router.post("/complete", completeGame);

export default router;
