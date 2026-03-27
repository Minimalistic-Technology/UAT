import express from 'express';
import multer from 'multer';
import {
  updateProfile,
  uploadAvatar,
  uploadResume,
  getUserById,
  submitKyc,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer configuration
// Multer configuration for Avatar
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  },
});

// Multer configuration for Resume
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Not a PDF! Please upload only PDF.'));
    }
  },
});

const kycUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.put('/resume', protect, resumeUpload.single('resume'), uploadResume);
router.get('/:id', protect, getUserById);
router.post('/kyc', protect, kycUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'lightbill', maxCount: 1 }
]), submitKyc);

export default router;