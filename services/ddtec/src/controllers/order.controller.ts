import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';

// Create a new order
export const createOrder = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { items, totalAmount, shippingInfo, paymentMethod } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!items || items.length === 0) {
            res.status(400).json({ msg: 'No items in order' });
            return;
        }

        const order = new Order({
            user: userId,
            items: items.map((item: any) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount,
            shippingInfo,
            paymentMethod,
            status: 'processing', // Default status
            coupon: req.body.coupon,
            discountAmount: req.body.discountAmount || 0
        });

        // Decrement Stock
        for (const item of items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                if (product.stock < item.quantity) {
                    res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
                    return;
                }
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const savedOrder = await order.save();

        // Clear user's cart after successful order
        await Cart.findOneAndDelete({ user: userId });

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ msg: 'Server error creating order' });
    }
};

// Get all orders (Admin only - placeholder for future)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};
