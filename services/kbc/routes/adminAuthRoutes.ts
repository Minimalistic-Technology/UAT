import { Router } from "express";
import {
  register,
  verify,
  login,
  forgotPassword,
  resetPassword,
  me,
  logout,
  createQuestioner,
  getQuestioners,
  updateQuestioner,
  deleteQuestioner,
} from "../controllers/adminAuthcontroller";


import { requireAdminAuth } from "../middlewares/authMiddleware";
import { limiter } from "../app";

const router = Router();

router.post("/admins/register", register);
router.get("/admins/verify", verify);
router.post("/admins/login", login);
router.post("/admins/password/forgot", forgotPassword);
router.post("/admins/password/reset", resetPassword);
router.get("/admins/me", requireAdminAuth, me);
router.post("/admins/logout", requireAdminAuth, logout);
router.post("/admins/questioners", requireAdminAuth, createQuestioner);
router.get("/admins/questioners", requireAdminAuth, getQuestioners);
router.put("/admins/questioners/:id", requireAdminAuth, updateQuestioner);
router.delete("/admins/questioners/:id", requireAdminAuth, deleteQuestioner);

export default router;
