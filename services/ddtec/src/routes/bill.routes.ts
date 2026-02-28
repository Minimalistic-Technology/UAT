import { Router } from 'express';
import { createBill, deleteBill, getAllBills, updateBill, getPublicBill } from '../controllers/bill.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// Create Bill (Admin Only)
router.post('/', auth as any, checkPermission(['order_manager']), createBill);

// Get All Bills (Admin Only)
router.get('/', auth as any, checkPermission(['order_manager', 'finance']), getAllBills);

// Get Public Bill (No Auth)
router.get('/public/:id', getPublicBill);

// Update Bill (Admin Only)
router.put('/:id', auth as any, checkPermission(['order_manager']), updateBill);

// Delete Bill (Admin Only)
router.delete('/:id', auth as any, checkPermission(['order_manager']), deleteBill);

export default router;
