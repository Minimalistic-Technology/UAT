import express from "express";
import { getLandingPageSettings } from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/landing", getLandingPageSettings);

export default router;
