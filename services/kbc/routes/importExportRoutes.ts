import express from "express";
import { importQuestions , exportQuestions } from "../controllers/importExportController";
import { requireAdminAuth } from "../middlewares/authMiddleware";
import { uploadSingle } from "../middlewares/uploadStream";

const router = express.Router();

router.post("/import/questions", requireAdminAuth, uploadSingle("file"), importQuestions);
router.get("/export/questions", requireAdminAuth, exportQuestions );

export default router;
