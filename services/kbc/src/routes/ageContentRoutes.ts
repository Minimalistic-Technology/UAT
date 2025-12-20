import express from "express";
import {
  getContentByAge,
  createAgeContent,
  updateAgeContent,
  deleteAgeContent,
} from "../controllers/ageContentController";
import { requireAdminAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/get", getContentByAge);

router.post("/create", requireAdminAuth, createAgeContent);
router.put("/update/:id", requireAdminAuth, updateAgeContent);
router.delete("/delete/:id", requireAdminAuth, deleteAgeContent);

export default router;
