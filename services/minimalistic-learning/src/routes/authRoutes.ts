import { Router } from 'express';
import {
  signup,
  login,
  refreshToken,
  initiatePasswordReset,
  completePasswordReset
} from '../controllers/authController';
import { loginLimiter, signupLimiter } from '../config/rateLimit';

const router = Router();

router.post('/signup', signupLimiter, signup);
router.post('/login', loginLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/password-reset/initiate', initiatePasswordReset);
router.post('/password-reset/complete', completePasswordReset);

export default router;


