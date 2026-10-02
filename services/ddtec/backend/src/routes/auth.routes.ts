import { Router } from 'express';
import { register, login, logout, googleAuth, getMe, sendOtp, verifyOtp, createUser, toggleUserStatus, updateUser, updateMe, checkUser, changePassword, updateCreditBalance, getAllUsers } from '../controllers/auth.controller';
import { auth, checkPermission, checkGranularPermission } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter, sensitiveAccountActionLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/logout', logout);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.put('/change-password', auth, sensitiveAccountActionLimiter, changePassword);
router.post('/check-user', authLimiter, checkUser);

// Admin Routes
router.post('/create-user', auth as any, checkGranularPermission('users', 'add'), sensitiveAccountActionLimiter, createUser);
router.get('/users', auth as any, checkGranularPermission('users', 'view'), getAllUsers);
router.put('/users/:id/status', auth as any, checkGranularPermission('users', 'edit'), toggleUserStatus);
router.put('/users/:id/credit', auth as any, checkGranularPermission('users', 'edit'), updateCreditBalance);
router.put('/users/:id', auth as any, checkGranularPermission('users', 'edit'), updateUser);

export default router;
