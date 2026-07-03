import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Bill from '../models/Bill';
import Hub from '../models/Hub';
import RouteConfig from '../models/RouteConfig';
import NotificationService from '../services/notification.service';

// Create a new order
export const createOrder = async (req: Request | any, res: Response) => {
    try {
        const { items, totalAmount, shippingInfo, paymentMethod } = req.body;
        // User is optional
        const userId = (req as any).user ? (req as any).user.id : undefined;

        // Dynamic Route Check
        const checkoutRoute = await RouteConfig.findOne({ path: '/checkout' });
        if (checkoutRoute && !checkoutRoute.isActive) {
            return res.status(403).json({ msg: 'Order checkout is temporarily offline.' });
        }

        if (!items || items.length === 0) {
            res.status(400).json({ msg: 'No items in order' });
            return;
        }

        const orderData: any = {
            items: [], // We will push items dynamically after computing router assignments
            totalAmount,
            shippingInfo,
            paymentMethod,
            status: 'pending',
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

        // Order Routing Engine
        const customerPincode = shippingInfo.zip.trim();
        const allHubs = await Hub.find({ isActive: true });

        // Find Local Hub (nearest origin if pincode matches)
        const localHub = allHubs.find(h => h.pincodes.includes(customerPincode));

        const finalOrderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ msg: `Product not found for ID: ${item.product._id}` });
            }

            const reqQty = item.quantity;
            let assignedHubId = null;

            // 1. Check Local Hub first
            if (localHub && product.warehouseStock) {
                const localStockEntry = product.warehouseStock.find(ws => ws.hubId.toString() === localHub._id.toString());
                if (localStockEntry && localStockEntry.quantity >= reqQty) {
                    assignedHubId = localHub._id;
                    localStockEntry.quantity -= reqQty;
                }
            }

            // 2. If Local Hub fails, check National Hubs (Any hub with stock)
            if (!assignedHubId && product.warehouseStock) {
                for (const ws of product.warehouseStock) {
                    if (ws.quantity >= reqQty) {
                        assignedHubId = ws.hubId;
                        ws.quantity -= reqQty;
                        break;
                    }
                }
            }

            // 3. Fallback to Global Stock (Legacy compatibility if warehouseStock isn't strictly maintained yet)
            if (!assignedHubId && product.stock >= reqQty) {
                // If global stock has it, we just don't assign a hub explicitly (handled centrally), 
                // OR logically we should fail it. But for smooth transition, we allow it.
            } else if (!assignedHubId) {
                return res.status(400).json({ msg: `Insufficient regional stock for product: ${product.name}` });
            }

            // Global stock decrement for sanity
            product.stock -= reqQty;
            await product.save();

            finalOrderItems.push({
                product: product._id,
                quantity: reqQty,
                price: item.product.price,
                assignedHubId: assignedHubId || undefined,
                itemStatus: 'pending'
            });
        }

        orderData.items = finalOrderItems;
        const newOrderObj = new Order(orderData);
        const savedOrder = await newOrderObj.save();


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

// Get all orders (With Role-Based Hub Logic)
export const getAllOrders = async (req: Request | any, res: Response) => {
    try {
        let filter: any = {};

        // If the user is a warehouse staff, strictly limit visibility to orders containing items assigned to their hubId
        if (req.user && req.user.role === 'warehouse' && req.user.hubId) {
            filter = { 'items.assignedHubId': req.user.hubId };
        }

        let orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        // Strip out items from the order that belong to other warehouses
        if (req.user && req.user.role === 'warehouse' && req.user.hubId) {
            const currentHubId = req.user.hubId.toString();
            // Transform Mongoose docs to standard objects to manipulate the array
            orders = orders.map((order: any) => {
                const doc = order.toObject ? order.toObject() : order;
                doc.items = doc.items.filter((item: any) =>
                    item.assignedHubId && item.assignedHubId.toString() === currentHubId
                );
                return doc;
            });
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
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

// Update Order Item Status (Warehouse / Admin)
export const updateOrderItemStatus = async (req: Request | any, res: Response) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'packed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid item status' });
        }

        const order: any = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        const item = order.items.find((i: any) => i._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({ msg: 'Item not found in order' });
        }

        if (req.user && req.user.role === 'warehouse') {
            if (!item.assignedHubId || item.assignedHubId.toString() !== req.user.hubId.toString()) {
                return res.status(403).json({ msg: 'Not authorized to update this item' });
            }
        }

        item.itemStatus = status;

        // Auto-update parent order status based on items if we wanted to
        const allPending = order.items.every((i: any) => i.itemStatus === 'pending');
        const allDelivered = order.items.every((i: any) => i.itemStatus === 'delivered');
        if (allDelivered) order.status = 'delivered';
        else if (!allPending && order.status === 'pending') order.status = 'processing';

        await order.save();

        res.json(order);
    } catch (error) {
        console.error('Error updating order item:', error);
        res.status(500).json({ msg: 'Server error updating order item' });
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
