import express from 'express';
import { createShareLink, getSharedLink, getAnalytics, getMyLinks, deleteSharedLink } from '../controllers/shareController';
import { protect, adminMode, adminOrHRAdminMode } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', protect, adminOrHRAdminMode, createShareLink);
router.get('/analytics', protect, adminOrHRAdminMode, getAnalytics);
router.get('/my-links', protect, getMyLinks);
router.delete('/:id', protect, adminOrHRAdminMode, deleteSharedLink);
router.get('/:token', getSharedLink);

export default router;
