import { Router } from 'express';
import { getProductReviews, getMyReview, submitReview, deleteReview } from '../controllers/review.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/reviews/product/:productId
router.get('/product/:productId', getProductReviews);

// GET /api/reviews/product/:productId/mine (Logged-in user's own review, if any)
router.get('/product/:productId/mine', auth as any, getMyReview);

// POST /api/reviews/product/:productId (Create or update the logged-in user's review)
router.post('/product/:productId', auth as any, submitReview);

// DELETE /api/reviews/:id (Owner or admin)
router.delete('/:id', auth as any, deleteReview);

export default router;
