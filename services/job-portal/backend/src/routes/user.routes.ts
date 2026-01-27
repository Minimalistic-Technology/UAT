import express from 'express';
import multer from 'multer';
import {
  updateProfile,
  uploadAvatar,
  uploadResume,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/resume', protect, upload.single('resume'), uploadResume);

export default router;