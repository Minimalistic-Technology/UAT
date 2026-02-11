import express from "express";
import {
  getBanks,
  createBank,
  getBank,
  updateBank,
  deleteBank,
  togglePublish,
} from "../controllers/questionBankController";
import { requireAdminAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/banks", requireAdminAuth, getBanks);
router.post("/banks", requireAdminAuth, createBank);
router.get("/banks/:id", requireAdminAuth, getBank);
router.put("/banks/:id", requireAdminAuth, updateBank);
router.delete("/banks/:id", requireAdminAuth, deleteBank);
router.post("/banks/:id/publish", requireAdminAuth, togglePublish);

export default router;
