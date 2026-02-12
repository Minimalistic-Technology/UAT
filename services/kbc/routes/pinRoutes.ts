import express from "express";
import { createPin, verifyPin, changePin, resetPin , getPin} from "../controllers/pinController";
import { requireAdminAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", requireAdminAuth, createPin);
router.post("/verify", requireAdminAuth, verifyPin);
router.post("/change", requireAdminAuth, changePin);
router.post("/reset", requireAdminAuth, resetPin);
router.get("/check", requireAdminAuth, getPin);

export default router;