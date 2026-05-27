import express from 'express';
import { createOrder, getAdminOrders, getHROrders, getMyOrders, updateOrderStatus } from '../controllers/orderController';
import { protect, adminMode, adminOrHRAdminMode } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin', protect, adminMode, getAdminOrders);
router.get('/hr', protect, adminOrHRAdminMode, getHROrders);
router.put('/:id/status', protect, adminMode, updateOrderStatus);

export default router;
