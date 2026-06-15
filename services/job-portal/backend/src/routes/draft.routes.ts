import { Router } from "express";
import { protect, isEmployer } from "../middleware/auth.middleware.js";
import {
  saveDraft,
  getDrafts,
  getDraft,
  deleteDraft,
} from "../controllers/draft.controller.js";

const router = Router();

router.post("/", protect, isEmployer, saveDraft);
router.get("/", protect, isEmployer, getDrafts);
router.get("/:id", protect, isEmployer, getDraft);
router.delete("/:id", protect, isEmployer, deleteDraft);

export default router;
