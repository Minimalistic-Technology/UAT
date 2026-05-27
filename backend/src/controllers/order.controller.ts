import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Bill from '../models/Bill';
import NotificationService from '../services/notification.service';

// Create a new order
export const createOrder = async (req: Request | any, res: Response) => {
    try {
        const { items, totalAmount, shippingInfo, paymentMethod } = req.body;
        // User is optional
        const userId = (req as any).user ? (req as any).user.id : undefined;

        if (!items || items.length === 0) {
            res.status(400).json({ msg: 'No items in order' });
            return;
        }

        const orderData: any = {
            items: items.map((item: any) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount,
            shippingInfo,
            paymentMethod,
            status: 'pending', // Default status is pending
            coupon: req.body.coupon,
            discountAmount: req.body.discountAmount || 0
        };

        if (userId) {
            orderData.user = userId;
        }

        if (paymentMethod === 'credit') {
            if (!userId) {
                return res.status(400).json({ msg: 'User must be logged in to use credit points' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            if ((user.creditBalance || 0) < totalAmount) {
                return res.status(400).json({ msg: 'Insufficient credit balance' });
            }
            user.creditBalance = (user.creditBalance || 0) - totalAmount;
            await user.save();
        }

        const order = new Order(orderData);

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

        // Auto-create Bill
        try {
            const billItems = [];
            for (const item of items) {
                const product = await Product.findById(item.product._id);
                billItems.push({
                    name: product?.name || 'Product',
                    price: item.product.price,
                    quantity: item.quantity,
                    taxes: product?.taxes || [],
                    fromInventory: true,
                    productId: item.product._id
                });
            }

            const billData = {
                items: billItems,
                totalAmount: savedOrder.totalAmount,
                customerInfo: {
                    name: shippingInfo.fullName,
                    phone: shippingInfo.phone || '', // Need to ensure phone is in shippingInfo or checkout
                    email: shippingInfo.email,
                    address: `${shippingInfo.address}, ${shippingInfo.city}`
                },
                source: 'order_auto',
                user: userId
            };

            const newBill = new Bill(billData);
            const savedBill = await newBill.save();
            (savedOrder as any).billId = savedBill._id; // Attach for reference if needed
        } catch (billError) {
            console.error('Error auto-creating bill:', billError);
        }

        // Send Order Confirmation Email (Async - don't block response)
        // We populate the product data for the email template
        Order.findById(savedOrder._id).populate('items.product').then(populatedOrder => {
            if (populatedOrder) {
                NotificationService.sendOrderConfirmation(populatedOrder).catch(err => {
                    console.error('[ORDER-EMAIL-ERROR] Failed to send confirmation:', err);
                });
            }
        });

        // Clear user's cart after successful order if logged in
        if (userId) {
            await Cart.findOneAndDelete({ user: userId });
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ msg: 'Server error creating order' });
    }
};

// Get all orders (Admin only - placeholder for future)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get current user's orders
export const getMyOrders = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ msg: 'Server error fetching orders' });
    }
};

// Update Order Status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Send Email Alert for order status update (Only for users)
        NotificationService.sendOrderStatusUpdate(order, status).catch(err => {
            console.error('[EMAIL-ERROR] Failed to send order status update:', err);
        });

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};
// Update Order (Admin only)
export const updateOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Delete Order (Admin only)
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        res.json({ msg: 'Order deleted' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};
