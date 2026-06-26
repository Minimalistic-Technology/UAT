import { Router } from 'express';
import { getPublicSettings, getSystemStatus, subscribeNewsletter, getSiteContent, getTeamMembers } from '../controllers/publicController';

const router = Router();

// No auth required
router.get('/status', getSystemStatus);
router.get('/settings', getPublicSettings);
router.post('/subscribe', subscribeNewsletter);
router.get('/content/:page', getSiteContent);
router.get('/team', getTeamMembers);

export default router;
