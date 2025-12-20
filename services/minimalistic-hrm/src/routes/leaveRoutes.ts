import express from "express";
import { isUser, isAdmin, isAdminOrHr } from "../middleware/authMiddleware";
import {
  applyLeave,
  editLeave,
  handleLeave,
  getLeaves,
  getLeavesAll,
  getLeaveById,
  deleteLeave,
} from "../controllers/leaveController";

const router = express.Router();

router.post("/apply", isUser, applyLeave);
router.put("/edit/:id", isUser, editLeave);
router.get("/myleaves", isUser, getLeaves);

router.put("/handle/:id", isUser, isAdminOrHr, handleLeave);
router.get("/leaves", isUser, isAdminOrHr, getLeavesAll);
router.get("/employee/:id", isUser, isAdminOrHr, getLeaveById);

router.delete("/delete/:id", isUser, isAdminOrHr, deleteLeave);

export default router;
