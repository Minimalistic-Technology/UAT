import { Router } from 'express';
import { getPublicSettings, subscribeNewsletter, getSiteContent } from '../controllers/publicController';

const router = Router();

// No auth required — public feature flags only
router.get('/settings', getPublicSettings);
router.post('/subscribe', subscribeNewsletter);
router.get('/content/:page', getSiteContent);

export default router;
