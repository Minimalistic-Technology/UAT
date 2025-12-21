import express from "express";
import { verifyMe } from "../controllers/tokenVerifyController";
const router = express.Router();

router.get("/me", verifyMe);

export default router;
