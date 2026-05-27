
import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateQuantity } from '../controllers/cart.controller';
import auth from '../middleware/auth.middleware';

const router = Router();

// Retrieve user's cart
router.get('/', auth, getCart);

// Add item to cart
router.post('/add', auth, addToCart);

// Update item quantity
router.put('/update', auth, updateQuantity);

// Remove item from cart (using productId as ID)
router.delete('/:itemId', auth, removeFromCart);

export default router;
