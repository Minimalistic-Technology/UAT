import { Router } from 'express';
import { cashfreeWebhook, createOrder, deleteOrder, getAllOrders, getMyOrders, updateOrder, updateOrderStatus, verifyCashfreePayment } from '../controllers/order.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';
import optionalAuth from '../middleware/optionalAuth.middleware';

const router = Router();

// Create Order (Guest or User)
router.post('/', optionalAuth as any, createOrder);

// Cashfree server-to-server webhook (no auth - verified via HMAC signature)
router.post('/payment/cashfree/webhook', cashfreeWebhook);

// Verify online payment status (called from the return_url page after redirect)
router.get('/:id/payment/verify', optionalAuth as any, verifyCashfreePayment);

// Get My Orders (Logged in User)
router.get('/my-orders', auth as any, getMyOrders);

// Get All Orders (Admin Only)
router.get('/', auth as any, checkPermission(['order_manager', 'customer_support', 'warehouse']), getAllOrders);

// Update Order Status (Admin Only)
router.put('/:id/status', auth as any, checkPermission(['order_manager', 'warehouse']), updateOrderStatus);

// Update Order (Admin Only)
router.put('/:id', auth as any, checkPermission(['order_manager']), updateOrder);

// Delete Order (Admin Only)
router.delete('/:id', auth as any, checkPermission(['order_manager']), deleteOrder);

export default router;
