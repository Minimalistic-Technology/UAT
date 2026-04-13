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
import { validate } from '../middleware/validate.middleware.js';
import { body } from 'express-validator';

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

export const kycValidation = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),

  body("aadharNo")
    .trim()
    .notEmpty()
    .withMessage("Aadhaar number is required")
    .matches(/^\d{12}$/)
    .withMessage("Aadhaar must be exactly 12 digits"),

  body("gstNo")
    .trim()
    .notEmpty()
    .withMessage("GST number is required")
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("Invalid GST number")
    .toUpperCase(),

  body("cinNo")
    .trim()
    .notEmpty()
    .withMessage("CIN number is required")
    .matches(/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .withMessage("Invalid CIN number")
    .toUpperCase(),
];

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.put('/resume', protect, resumeUpload.single('resume'), uploadResume);
router.get('/:id', protect, getUserById);
router.post('/kyc', protect, kycValidation, kycUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'lightbill', maxCount: 1 }
]), submitKyc);

export default router;