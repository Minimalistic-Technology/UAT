import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';
import * as controller from '../controllers/auth.controller';

const router = Router();

router.post('/signup', validateBody(signupSchema), controller.signup);
router.post('/verify-otp', validateBody(verifyOtpSchema), controller.verifyOtp);
router.post('/resend-otp', validateBody(resendOtpSchema), controller.resendOtp);
router.post('/login', validateBody(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), controller.resetPassword);
router.get('/me', requireAuth, controller.me);

export default router;
