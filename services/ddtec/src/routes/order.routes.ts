import { Router } from 'express';
import { createOrder, getAllOrders } from '../controllers/order.controller';
import authMiddleware from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = Router();

// Create Order (Protected)
router.post('/', authMiddleware as any, createOrder);

// Get All Orders (Admin Only)
router.get('/', authMiddleware as any, adminMiddleware, getAllOrders);

export default router;
