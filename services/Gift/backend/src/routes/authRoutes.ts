import express from 'express';
import { register, login, getAllUsers, verifyOtp, updateUserRole, deleteUser } from '../controllers/authController';
import { protect, adminMode } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/users', protect, adminMode, getAllUsers);
router.put('/users/:id/role', protect, adminMode, updateUserRole);
router.delete('/users/:id', protect, adminMode, deleteUser);

export default router;
