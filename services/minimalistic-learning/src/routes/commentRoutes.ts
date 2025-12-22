import { Router } from 'express';
import { deleteComment } from '../controllers/commentController';
import requireAuth from '../middleware/requireAuth';


const router = Router();
router.delete('/comments/:id', requireAuth, deleteComment);
export default router;