
import { Request, Response } from 'express';
import Cart from '../models/Cart';

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity: quantity || 1 });
        }

        await cart.save();
        // Repopulate to return full product details
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
// Note: We'll remove by ProductId for simplicity, or we can use the subdocument _id
export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        // Filter out the item (expecting productId in params)
        cart.items = cart.items.filter(item => item.product.toString() !== req.params.itemId);

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(updatedCart);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateQuantity = async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ msg: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            res.json(updatedCart);
        } else {
            return res.status(404).json({ msg: 'Item not found in cart' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
