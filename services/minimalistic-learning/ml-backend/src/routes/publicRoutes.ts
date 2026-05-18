import { Router } from 'express';
import { getPublicSettings, subscribeNewsletter } from '../controllers/publicController';

const router = Router();

// No auth required — public feature flags only
router.get('/settings', getPublicSettings);
router.post('/subscribe', subscribeNewsletter);

export default router;

