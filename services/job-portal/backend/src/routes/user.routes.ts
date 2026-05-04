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

export const profileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('location.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().notEmpty().withMessage('Skill cannot be empty'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('languages.*').optional().trim().notEmpty().withMessage('Language cannot be empty'),
  body('experience').optional().isArray().withMessage('Experience must be an array'),
  body('experience.*.title').optional().trim().notEmpty().withMessage('Experience title is required'),
  body('experience.*.company').optional().trim().notEmpty().withMessage('Experience company is required'),
  body('experience.*.location').optional().trim().notEmpty().withMessage('Experience location is required'),
  body('experience.*.startDate').optional().trim().notEmpty().withMessage('Experience start date is required'),
  body('experience.*.endDate').optional({ checkFalsy: true }).trim(),
  body('experience.*.current').optional().isBoolean().withMessage('Experience current must be a boolean'),
  body('experience.*.description').optional({ checkFalsy: true }).trim(),
  body('education').optional().isArray().withMessage('Education must be an array'),
  body('education.*.degree').optional().trim().notEmpty().withMessage('Education degree is required'),
  body('education.*.institution').optional().trim().notEmpty().withMessage('Education institution is required'),
  body('education.*.graduationYear').optional().trim().notEmpty().withMessage('Education graduation year is required'),
  body('education.*.fieldOfStudy').optional().trim().notEmpty().withMessage('Education field of study is required'),
];

router.put('/profile', protect, validate(profileValidation), updateProfile);
router.put('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.put('/resume', protect, resumeUpload.single('resume'), uploadResume);
router.get('/:id', protect, getUserById);
router.post('/kyc', protect, kycUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'lightbill', maxCount: 1 }
]), validate(kycValidation), submitKyc);

export default router;