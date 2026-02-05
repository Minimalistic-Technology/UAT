import { Router } from 'express';
import { getHome, getHealth } from '../controllers/home.controller';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.get('/', getHome);
router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);

export default router;
