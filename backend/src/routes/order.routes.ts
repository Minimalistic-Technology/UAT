import { Router } from 'express';
import { createOrder, deleteOrder, getAllOrders, getMyOrders, updateOrder, updateOrderStatus, updateOrderItemStatus } from '../controllers/order.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';
import optionalAuth from '../middleware/optionalAuth.middleware';

const router = Router();

// Create Order (Guest or User)
router.post('/', optionalAuth as any, createOrder);

// Get My Orders (Logged in User)
router.get('/my-orders', auth as any, getMyOrders);

// Get All Orders (Admin Only)
router.get('/', auth as any, checkPermission(['order_manager', 'customer_support', 'warehouse', 'inventory_manager']), getAllOrders);

// Update Order Status (Admin Only - Legacy global status)
router.put('/:id/status', auth as any, checkPermission(['order_manager', 'inventory_manager']), updateOrderStatus);

// Update Specific Order Item Status (Warehouse / Admin)
router.put('/:orderId/items/:itemId/status', auth as any, checkPermission(['order_manager', 'warehouse', 'inventory_manager']), updateOrderItemStatus);

// Update Order (Admin Only)
router.put('/:id', auth as any, checkPermission(['order_manager', 'inventory_manager']), updateOrder);

// Delete Order (Admin Only)
router.delete('/:id', auth as any, checkPermission(['order_manager', 'inventory_manager']), deleteOrder);

export default router;
