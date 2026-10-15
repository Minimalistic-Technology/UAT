import { Router } from 'express';
import {
    getPurchaseRecords,
    getPurchaseRecordById,
    createPurchaseRecord,
    updatePurchaseRecord,
    deletePurchaseRecord,
    uploadPurchaseImage,
    deletePurchaseImage
} from '../controllers/purchaseRecord.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';
import { uploadPurchaseImagesMiddleware, uploadSinglePurchaseImageMiddleware } from '../middleware/upload.middleware';

const router = Router();

// @route   POST /api/purchases/upload-image
// @desc    Upload an image (product image or bill screenshot) to Cloudinary
// @access  Private/Admin
router.post('/upload-image', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), uploadSinglePurchaseImageMiddleware, uploadPurchaseImage);

// @route   POST /api/purchases/delete-image
// @desc    Delete an image from Cloudinary
// @access  Private/Admin
router.post('/delete-image', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), deletePurchaseImage);

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
router.post('/', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), uploadPurchaseImagesMiddleware, createPurchaseRecord);

// @route   PUT /api/purchases/:id
// @desc    Update purchase record
// @access  Private/Admin
router.put('/:id', auth, checkPermission(['product_manager', 'order_manager', 'finance', 'admin', 'super_admin']), uploadPurchaseImagesMiddleware, updatePurchaseRecord);

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase record
// @access  Private/Admin
router.delete('/:id', auth, checkPermission(['product_manager', 'admin', 'super_admin']), deletePurchaseRecord);

export default router;
