import express from 'express';
import { createShareLink, getSharedLink, getAnalytics } from '../controllers/shareController';
import { protect, adminMode } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', protect, adminMode, createShareLink);
router.get('/analytics', protect, adminMode, getAnalytics);
router.get('/:token', getSharedLink);

export default router;
