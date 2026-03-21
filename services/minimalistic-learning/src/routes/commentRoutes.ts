import { Router } from 'express';
import { 
  createComment, 
  getPostComments, 
  updateComment, 
  deleteComment, 
} from '../controllers/commentController';
import requireAuth from '../middleware/requireAuth';

const router = Router();

router.post('/post/:postId', requireAuth, createComment);
router.get('/post/:postId', getPostComments);

router.put('/:id', requireAuth, updateComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;