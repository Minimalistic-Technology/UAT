import express from "express";
import { requireAdminAuth } from "../middlewares/authMiddleware";
import { requireUserAuth } from "../middlewares/userAuthMiddleware";
import { createGameResult,
         getScoresForGameConfig,    
         userGameResult,  
 } from "../controllers/gameResultController";

const router = express.Router();

router.post("/create", requireUserAuth, createGameResult);
router.get("/get", requireUserAuth, getScoresForGameConfig);
router.get("/admin/get",requireAdminAuth , getScoresForGameConfig);
router.post("/user/result", requireUserAuth, userGameResult);
router.post("/admin/result/user", requireAdminAuth, userGameResult);

export default router;