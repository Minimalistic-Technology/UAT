import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleProductStatus } from '../controllers/products.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';
import { uploadProductImagesMiddleware } from '../middleware/upload.middleware';

const router = Router();

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST api/products
// @desc    Create a product (accepts multipart form data with image files, or plain JSON)
// @access  Private/Admin
router.post('/', auth, checkPermission(['product_manager']), uploadProductImagesMiddleware, createProduct);

// @route   PUT api/products/:id
// @desc    Update a product (accepts multipart form data with image files, or plain JSON)
// @access  Private/Admin
router.put('/:id', auth as any, checkPermission(['product_manager', 'order_manager', 'finance', 'warehouse']), uploadProductImagesMiddleware, updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, checkPermission(['product_manager']), deleteProduct);


// @route   PUT api/products/:id/status
// @desc    Toggle product status
// @access  Private/Admin
router.put('/:id/status', auth, checkPermission(['product_manager']), toggleProductStatus);

export default router;
