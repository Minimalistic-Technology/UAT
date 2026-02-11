import { Router } from 'express';
import { listPosts, getPostBySlug, listComments, createPost, updatePost, deletePost } from '../controllers/postController';
import { addComment } from '../controllers/commentController';
import requireAuth from '../middleware/requireAuth';

const router = Router();

router.get('/posts', listPosts);
router.get('/posts/:slug', getPostBySlug);
router.get('/posts/:id/comments', listComments);
router.post('/posts', requireAuth, createPost);        
router.put('/posts/:id', requireAuth, updatePost);       
router.delete('/posts/:id', requireAuth, deletePost);   
router.post('/posts/:id/comments', requireAuth, addComment);

export default router;
