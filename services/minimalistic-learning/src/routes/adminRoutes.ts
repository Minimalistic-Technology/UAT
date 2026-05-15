import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import {
  getSettings,
  updateSettings,
  getPendingPosts,
  getAllPostsAdmin,
  approvePost,
  rejectPost,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication (admin check is done inside each controller)
router.use(requireAuth);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

router.get('/posts/pending', getPendingPosts);
router.get('/posts/all', getAllPostsAdmin);
router.patch('/posts/:postId/approve', approvePost);
router.patch('/posts/:postId/reject', rejectPost);

export default router;
