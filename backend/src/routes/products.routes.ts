import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleProductStatus, checkProductDelivery } from '../controllers/products.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   GET api/products/:id/delivery
// @desc    Check delivery estimate by Pincode for a product
// @access  Public
router.get('/:id/delivery', checkProductDelivery);

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', auth, checkPermission(['product_manager', 'inventory_manager']), createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth as any, checkPermission(['product_manager', 'order_manager', 'finance', 'warehouse', 'inventory_manager']), updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, checkPermission(['product_manager', 'inventory_manager']), deleteProduct);


// @route   PUT api/products/:id/status
// @desc    Toggle product status
// @access  Private/Admin
router.put('/:id/status', auth, checkPermission(['product_manager', 'inventory_manager']), toggleProductStatus);

export default router;
