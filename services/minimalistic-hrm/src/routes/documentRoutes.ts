import express from "express";
import { isUser, isAdminOrHr } from "../middleware/authMiddleware";
import { upload } from "../middleware/multer"; // memoryStorage multer

import {
  uploadDocument,
  getEmployeeDocuments,
  verifyDocument,
  deleteDocument,
  reuploadDocument,
} from "../controllers/documentController";

const router = express.Router();

router.post(  "/upload",  isUser,  upload.single("file"),  uploadDocument);
router.get(  "/employee/:employeeId",  isUser,  getEmployeeDocuments);
router.put(  "/reupload/:docId",  isUser,  upload.single("file"),  reuploadDocument);
router.delete(  "/delete/:employeeId/:docId",  isUser,  deleteDocument);
router.patch(  "/verify/:employeeId/:docId",  isUser,  isAdminOrHr,  verifyDocument);

export default router;