import { Router } from 'express';
import { register, login, logout, getMe, sendOtp, verifyOtp, createUser, toggleUserStatus, updateUser, updateMe, checkUser, changePassword } from '../controllers/auth.controller';
import auth from '../middleware/auth.middleware';
import admin from '../middleware/admin.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.put('/change-password', auth, changePassword);
router.post('/check-user', checkUser);
// router.get('/me', auth, getMe); // Removed duplicate

// Admin Routes
router.post('/create-user', auth, admin, createUser);

router.put('/users/:id/status', auth, admin, toggleUserStatus);
router.put('/users/:id', auth, admin, updateUser);

export default router;
