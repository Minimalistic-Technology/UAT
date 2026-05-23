import { Router } from 'express';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment
} from '../controllers/commentController';
import requireAuth from '../middleware/requireAuth';
import checkDbPermission from '../middleware/checkDbPermission';

const router = Router();

router.post('/post/:postId', requireAuth, checkDbPermission, createComment);
router.get('/post/:postId', getPostComments);

router.put('/:id', requireAuth, checkDbPermission, updateComment);
router.delete('/:id', requireAuth, checkDbPermission, deleteComment);
router.post('/:id/like', requireAuth, checkDbPermission, likeComment);

export default router;