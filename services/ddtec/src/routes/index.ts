import { Router } from 'express';
import { getHome, getHealth } from '../controllers/home.controller';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';
import productsRoutes from './products.routes';
import cartRoutes from './cart.routes';
import adminRoutes from './admin.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import blogRoutes from './blog.routes';
import categoryRoutes from './category.routes';
import billRoutes from './bill.routes';
import settingsRoutes from './settings';
import purchaseRecordRoutes from './purchaseRecord.routes';
import crmContactRoutes from './crmContact.routes';

const router = Router();

router.get('/', getHome);
router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/blogs', blogRoutes);
router.use('/categories', categoryRoutes);
router.use('/bills', billRoutes);
router.use('/settings', settingsRoutes);
router.use('/purchases', purchaseRecordRoutes);
router.use('/inventory-records', purchaseRecordRoutes);
router.use('/contacts', crmContactRoutes);

export default router;
