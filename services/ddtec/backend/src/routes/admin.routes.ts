import { Router } from 'express';
import { getDashboardStats, getAllUsers, deleteUser } from '../controllers/admin.controller';
import { auth as authMiddleware, admin as adminMiddleware } from '../middleware/auth.middleware';
import scheduledEmailRoutes from './scheduledEmail.routes';

const router = Router();

// Scheduled Emails Sub-router
router.use('/scheduled-emails', scheduledEmailRoutes);

// Get Dashboard Stats (Admin Only)
router.get('/stats', authMiddleware as any, adminMiddleware, getDashboardStats);

// Manage Users
router.get('/users', authMiddleware as any, adminMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware as any, adminMiddleware, deleteUser);

export default router;
