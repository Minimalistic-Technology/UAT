import express from "express";
import {
  getBanks,
  createBank,
  getBank,
  updateBank,
  deleteBank,
  togglePublish,
  reorderBanks,
} from "../controllers/questionBankController";
import { requireAdminAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/banks", requireAdminAuth, getBanks);
router.post("/banks", requireAdminAuth, createBank);
router.get("/banks/:id", requireAdminAuth, getBank);
router.put("/banks/:id", requireAdminAuth, updateBank);
router.delete("/banks/:id", requireAdminAuth, deleteBank);
router.post("/banks/:id/publish", requireAdminAuth, togglePublish);
router.put("/banks/:id/reorder", requireAdminAuth, reorderBanks);

export default router;
