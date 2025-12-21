import express from "express";
import {
  getQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController";
import { requireAdminAuth } from "../middlewares/authMiddleware";
import { uploadSingle, validateUpload } from "../middlewares/uploadStream";

const router = express.Router();

/** Public reads (adjust auth as you prefer) */
router.get("/questions/byId/:id", getQuestionById);
router.get("/questions", getQuestions);

/** Admin-protected writes */
router.post(
  "/questions",
  requireAdminAuth,
  uploadSingle("file"),
  createQuestion
);

router.put(
  "/questions/:id",
  requireAdminAuth,
  uploadSingle("file"),
  updateQuestion
);

router.delete("/questions/:id", requireAdminAuth, deleteQuestion);


export default router;
