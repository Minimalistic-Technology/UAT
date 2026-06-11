import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// 1. Initial Microsoft OAuth login step
router.get('/microsoft', authController.login);

// 2. Callback from Microsoft
router.post('/microsoft/callback', authController.callback);

// 3. User Info (needs auth middleware)
router.get('/me', authController.getCurrentUser);

// 4. Logout
router.post('/logout', authController.logout);

export default router;
