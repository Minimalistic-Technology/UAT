import { Router } from 'express';
import { createOrder, deleteOrder, getAllOrders, getMyOrders, updateOrder, updateOrderStatus } from '../controllers/order.controller';
import authMiddleware from '../middleware/auth.middleware';
import optionalAuthMiddleware from '../middleware/optionalAuth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = Router();

// Create Order (Guest or User)
router.post('/', optionalAuthMiddleware as any, createOrder);

// Get My Orders (Logged in User)
router.get('/my-orders', authMiddleware as any, getMyOrders);

// Get All Orders (Admin Only)
router.get('/', authMiddleware as any, adminMiddleware, getAllOrders);

// Update Order Status (Admin Only)
router.put('/:id/status', authMiddleware as any, adminMiddleware, updateOrderStatus);

// Update Order (Admin Only)
router.put('/:id', authMiddleware as any, adminMiddleware, updateOrder);

// Delete Order (Admin Only)
router.delete('/:id', authMiddleware as any, adminMiddleware, deleteOrder);

export default router;
