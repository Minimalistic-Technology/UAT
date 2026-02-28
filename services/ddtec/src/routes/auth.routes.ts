import { Router } from 'express';
import { register, login, logout, getMe, sendOtp, verifyOtp, createUser, toggleUserStatus, updateUser, updateMe, checkUser, changePassword, updateCreditBalance, getAllUsers } from '../controllers/auth.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

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

// Admin Routes
router.post('/create-user', auth as any, checkPermission(['super_admin']), createUser);
router.get('/users', auth as any, checkPermission(['super_admin', 'customer_support']), getAllUsers);
router.put('/users/:id/status', auth as any, checkPermission(['super_admin']), toggleUserStatus);
router.put('/users/:id/credit', auth as any, checkPermission(['super_admin']), updateCreditBalance);
router.put('/users/:id', auth as any, checkPermission(['super_admin']), updateUser);

export default router;
