import express from 'express';
import multer from 'multer';
import { updateProfile, uploadAvatar, uploadResume, getUserById, } from '../controllers/user.controller.js';
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
        }
        else {
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
        }
        else {
            cb(new Error('Not a PDF! Please upload only PDF.'));
        }
    },
});
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.put('/resume', protect, resumeUpload.single('resume'), uploadResume);
router.get('/:id', protect, getUserById);
export default router;
