import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, adminMode } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, adminMode, upload.array('images', 5), createProduct as any);

router.route('/:id')
    .get(getProductById)
    .put(protect, adminMode, updateProduct)
    .delete(protect, adminMode, deleteProduct);

export default router;
