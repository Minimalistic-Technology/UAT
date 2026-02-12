import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller';
import { auth as protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
    .post(protect, admin, createCategory)
    .get(getCategories);

router.route('/:id')
    .get(getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

export default router;
