import { Router } from 'express';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../controllers/route.controller';
import { auth, admin } from '../middleware/auth.middleware';

const router = Router();

// Everyone can view routes (Frontend needs this to check what is active)
router.get('/', getRoutes);

// Only admins can modify routes
router.post('/', auth, admin, createRoute);
router.put('/:id', auth, admin, updateRoute);
router.delete('/:id', auth, admin, deleteRoute);

export default router;
