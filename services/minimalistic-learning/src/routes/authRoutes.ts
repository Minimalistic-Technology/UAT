import { Router } from 'express';
import {
  signup,
  login,
  refreshToken,
  initiatePasswordReset,
  completePasswordReset,
  getMe,
  logout,
  verifyOTP,
  updateProfile
} from '../controllers/authController';
import { loginLimiter, signupLimiter } from '../config/rateLimit';
import requireAuth from '../middleware/requireAuth';

const router = Router();

router.post('/signup', signupLimiter, signup);
router.post('/login', loginLimiter, login);
router.post('/verify-otp', verifyOTP);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);
router.post('/logout', requireAuth, logout);
router.post('/refresh-token', refreshToken);
router.post('/password-reset/initiate', initiatePasswordReset);
router.post('/password-reset/complete', completePasswordReset);

export default router;


