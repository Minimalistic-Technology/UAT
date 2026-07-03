import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
    .post(auth as any, checkPermission(['product_manager', 'inventory_manager']), createCategory)
    .get(getCategories);

router.route('/:id')
    .get(getCategoryById)
    .put(auth as any, checkPermission(['product_manager', 'inventory_manager']), updateCategory)
    .delete(auth as any, checkPermission(['product_manager', 'inventory_manager']), deleteCategory);

export default router;
