import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import linkRoutes from './link.routes';
import uploadRoutes from './upload.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/links', linkRoutes);
router.use('/uploads', uploadRoutes);
router.use('/public', publicRoutes);

export default router;
