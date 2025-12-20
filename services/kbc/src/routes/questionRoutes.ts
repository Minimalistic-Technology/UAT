import express from "express";
import {
  getQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
  previewQuestion,
} from "../controllers/questionController";
import { requireAdminAuth } from "../middlewares/authMiddleware";
import { uploadSingle, validateUpload } from '../middlewares/uploadStream';

const router = express.Router();
router.get("/questions/byId/:id", requireAdminAuth, getQuestionById);
router.get("/questions", requireAdminAuth, getQuestions);
router.delete("/questions/:id", requireAdminAuth, deleteQuestion);
router.post("/questions" , requireAdminAuth , uploadSingle('file'),   createQuestion);

router.put("/questions/:id", requireAdminAuth, uploadSingle('file') , updateQuestion);
router.delete("/questions/:id", requireAdminAuth, deleteQuestion);
router.post("/questions/bulk-import", requireAdminAuth, bulkImportQuestions);
router.get("/questions/:id/preview", requireAdminAuth, previewQuestion);

export default router;
