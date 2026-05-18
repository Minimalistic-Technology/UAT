import { Router } from 'express';
import requireAuth from '../middleware/requireAuth';
import isAdmin from '../middleware/isAdmin';
import {
  getSettings,
  updateSettings,
  getPendingPosts,
  getAllPostsAdmin,
  deletePostAdmin,
  approvePost,
  rejectPost,
} from '../controllers/adminController';

const router = Router();

// All admin routes require both authentication and admin role
router.use(requireAuth);
router.use(isAdmin);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

router.get('/posts/pending', getPendingPosts);
router.get('/posts/all', getAllPostsAdmin);
router.delete('/posts/:postId', deletePostAdmin);
router.patch('/posts/:postId/approve', approvePost);
router.patch('/posts/:postId/reject', rejectPost);

export default router;
