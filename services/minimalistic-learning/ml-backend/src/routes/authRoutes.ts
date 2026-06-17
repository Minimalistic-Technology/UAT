import { Router } from 'express';
import {
  signup,
  login,
  refreshToken,
  getMe,
  logout,
  verifyOTP,
  updateProfile
} from '../controllers/authController';
import { authStrictLimiter, signupLimiter } from '../config/rateLimit';
import requireAuth from '../middleware/requireAuth';

const router = Router();

router.post('/signup', signupLimiter, signup);
router.post('/login', authStrictLimiter, login);
router.post('/verify-otp', authStrictLimiter, verifyOTP);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);
router.post('/logout', requireAuth, logout);
router.post('/refresh-token', refreshToken);

export default router;


