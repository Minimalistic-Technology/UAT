import { Router } from 'express';
import { getHome, getHealth } from '../controllers/home.controller';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';
import productsRoutes from './products.routes';
import cartRoutes from './cart.routes';
import adminRoutes from './admin.routes';
import orderRoutes from './order.routes';

const router = Router();

router.get('/', getHome);
router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);

export default router;
