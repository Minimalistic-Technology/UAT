import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { getCollections, runQuery } from "../controllers/developer.controller.js";
import { GlobalRole } from "../models/User.model.js";

const router = Router();

router.use(protect);
router.use(authorize(GlobalRole.SUPER_ADMIN));

router.get("/collections", getCollections);
router.post("/query", runQuery);

export default router;
