import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications
} from '../controllers/notificationController';

const router = Router();

router.use(requireAuth);

router.get('/', getMyNotifications);
router.delete('/clear-all', clearAllNotifications);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);

export default router;
