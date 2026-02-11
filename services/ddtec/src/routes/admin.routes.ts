import { Router } from 'express';
import { getDashboardStats, getAllUsers, deleteUser } from '../controllers/admin.controller';
import authMiddleware from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = Router();

// Get Dashboard Stats (Admin Only)
router.get('/stats', authMiddleware as any, adminMiddleware, getDashboardStats);

// Manage Users
router.get('/users', authMiddleware as any, adminMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware as any, adminMiddleware, deleteUser);



export default router;
