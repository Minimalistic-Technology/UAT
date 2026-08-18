import { Router } from 'express';
import {
    getPurchaseRecords,
    getPurchaseRecordById,
    createPurchaseRecord,
    updatePurchaseRecord,
    deletePurchaseRecord
} from '../controllers/purchaseRecord.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// @route   GET /api/purchases
// @desc    Get all purchase / inventory update records
// @access  Private/Admin
router.get('/', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), getPurchaseRecords);

// @route   GET /api/purchases/:id
// @desc    Get single purchase record by ID
// @access  Private/Admin
router.get('/:id', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), getPurchaseRecordById);

// @route   POST /api/purchases
// @desc    Create purchase record (new product or existing product restock)
// @access  Private/Admin
router.post('/', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), createPurchaseRecord);

// @route   PUT /api/purchases/:id
// @desc    Update purchase record
// @access  Private/Admin
router.put('/:id', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), updatePurchaseRecord);

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase record
// @access  Private/Admin
router.delete('/:id', auth, checkPermission(['product_manager', 'admin', 'super_admin']), deletePurchaseRecord);

export default router;
