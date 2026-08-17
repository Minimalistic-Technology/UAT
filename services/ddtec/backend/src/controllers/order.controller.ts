import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Bill from '../models/Bill';
import RouteConfig from '../models/RouteConfig';
import NotificationService from '../services/notification.service';
import CashfreeService from '../services/cashfree.service';

// Creates the Bill record and dispatches the order confirmation + invoice email.
// Shared by: COD/credit orders (called immediately at creation) and Cashfree
// orders (called once payment success is confirmed via webhook or verify endpoint).
const finalizeOrder = async (orderId: string) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        const billItems = [];
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            billItems.push({
                name: product?.name || 'Product',
                price: item.price,
                quantity: item.quantity,
                taxes: product?.taxes || [],
                fromInventory: true,
                productId: item.product
            });
        }

        const billData = {
            items: billItems,
            totalAmount: order.totalAmount,
            customerInfo: {
                name: order.shippingInfo.fullName,
                phone: (order.shippingInfo as any).phone || '',
                email: order.shippingInfo.email,
                address: `${order.shippingInfo.address}, ${order.shippingInfo.city}`
            },
            source: 'order_auto',
            user: order.user
        };

        const newBill = new Bill(billData);
        await newBill.save();
    } catch (billError) {
        console.error('Error auto-creating bill:', billError);
    }

    const populatedOrder = await Order.findById(orderId).populate('items.product');
    if (populatedOrder) {
        NotificationService.sendOrderConfirmation(populatedOrder).catch(err => {
            console.error('[ORDER-EMAIL-ERROR] Failed to send confirmation:', err);
        });
    }
};

// Restores stock for an order whose online payment failed/expired/dropped.
const restockOrderItems = async (order: any) => {
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
};

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

        const isOnlinePayment = paymentMethod === 'cashfree';

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
            discountAmount: req.body.discountAmount || 0,
            // COD is settled on delivery; credit is deducted instantly below; Cashfree starts pending until the gateway confirms
            paymentStatus: paymentMethod === 'credit' ? 'paid' : 'pending'
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

        if (isOnlinePayment) {
            // Online payment: create the Cashfree order and hand the payment_session_id back
            // to the frontend so it can launch hosted checkout. Bill + confirmation email are
            // deferred until the payment actually succeeds (see handleCashfreePaymentSuccess).
            try {
                const returnUrl = `${(process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')}/checkout/payment-status?order_id=${savedOrder._id}`;

                const customerName = shippingInfo.fullName || 'Customer';
                const customer = userId ? await User.findById(userId) : null;

                const cfResult = await CashfreeService.createOrder({
                    orderId: savedOrder._id.toString(),
                    amount: totalAmount,
                    customerId: userId ? userId.toString() : `guest_${savedOrder._id}`,
                    customerName,
                    customerEmail: shippingInfo.email,
                    customerPhone: shippingInfo.phone || customer?.phone || '9999999999',
                    returnUrl
                });

                savedOrder.cashfree = {
                    orderId: savedOrder._id.toString(),
                    paymentSessionId: cfResult.paymentSessionId,
                    cfOrderId: cfResult.cfOrderId
                };
                await savedOrder.save();

                if (userId) {
                    await Cart.findOneAndDelete({ user: userId });
                }

                res.status(201).json({
                    ...savedOrder.toObject(),
                    paymentSessionId: cfResult.paymentSessionId
                });
                return;
            } catch (cfError: any) {
                console.error('[CASHFREE-ERROR] Failed to create Cashfree order:', cfError.response?.data || cfError.message || cfError);
                // Roll back stock decrement and the order since checkout could not be initiated
                await restockOrderItems(savedOrder);
                await Order.findByIdAndDelete(savedOrder._id);
                res.status(502).json({ msg: 'Failed to initiate online payment. Please try again.' });
                return;
            }
        }

        // COD / Credit: settle immediately
        await finalizeOrder(savedOrder._id.toString());

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

// Applies a terminal Cashfree order status to our Order record.
// Idempotent: repeated calls (webhook retries + return_url verification racing) are safe,
// since the finalize/failure-email steps only fire on the first transition into paid/failed.
const applyCashfreeOrderStatus = async (orderId: string, cfOrderStatus: string, cfPaymentId?: string, failureReason?: string) => {
    const order = await Order.findById(orderId);
    if (!order) return null;

    // Already settled - nothing to do (keeps webhook + verify-endpoint calls idempotent)
    if (order.paymentStatus === 'paid' || order.paymentStatus === 'failed') {
        return order;
    }

    if (cfOrderStatus === 'PAID') {
        order.paymentStatus = 'paid';
        order.cashfree = { ...(order.cashfree || {}), cfPaymentId, lastEvent: 'PAID' };
        await order.save();
        await finalizeOrder(order._id.toString());
    } else if (cfOrderStatus === 'EXPIRED' || cfOrderStatus === 'TERMINATED') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        order.cashfree = { ...(order.cashfree || {}), lastEvent: cfOrderStatus };
        await order.save();
        await restockOrderItems(order);
        NotificationService.sendPaymentFailedEmail(order, failureReason).catch(err => {
            console.error('[PAYMENT-FAILED-EMAIL-ERROR]', err);
        });
    }

    return order;
};

// Cashfree Webhook (server-to-server, no auth - verified via HMAC signature)
export const cashfreeWebhook = async (req: Request | any, res: Response) => {
    try {
        const signature = req.header('x-webhook-signature') || '';
        const timestamp = req.header('x-webhook-timestamp') || '';
        const rawBody = req.rawBody || JSON.stringify(req.body);

        const isValid = CashfreeService.verifyWebhookSignature(signature, rawBody, timestamp);
        if (!isValid) {
            console.warn('[CASHFREE-WEBHOOK] Invalid signature received');
            return res.status(401).json({ msg: 'Invalid webhook signature' });
        }

        const { type, data } = req.body;
        const orderId = data?.order?.order_id;
        const paymentStatus = data?.payment?.payment_status; // SUCCESS, FAILED, USER_DROPPED, etc.
        const cfPaymentId = data?.payment?.cf_payment_id;

        if (!orderId) {
            return res.status(200).json({ msg: 'No order_id in payload, ignored' });
        }

        if (type === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS') {
            await applyCashfreeOrderStatus(orderId, 'PAID', cfPaymentId);
        } else if (type === 'PAYMENT_FAILED_WEBHOOK' || type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
            await applyCashfreeOrderStatus(orderId, 'EXPIRED', cfPaymentId, data?.payment?.payment_message || data?.error_details?.error_description);
        }

        res.status(200).json({ msg: 'Webhook processed' });
    } catch (error) {
        console.error('[CASHFREE-WEBHOOK-ERROR]', error);
        // Still ack with 200 to avoid excessive gateway retries once we've logged the issue;
        // Cashfree also lets us re-fetch state via the verify endpoint below.
        res.status(200).json({ msg: 'Webhook received with processing error' });
    }
};

// Called by the frontend's return_url page right after redirect back from Cashfree hosted checkout.
// Fetches the authoritative status directly from Cashfree (webhook delivery isn't guaranteed to have landed yet).
export const verifyCashfreePayment = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.paymentMethod !== 'cashfree') {
            return res.status(400).json({ msg: 'Order is not an online payment order' });
        }

        const cfOrderId = order.cashfree?.orderId || order._id.toString();
        const cfOrder = await CashfreeService.fetchOrder(cfOrderId);

        const updatedOrder = await applyCashfreeOrderStatus(
            order._id.toString(),
            cfOrder.order_status,
            undefined,
            cfOrder.order_status !== 'PAID' ? 'Payment was not completed' : undefined
        );

        res.json({
            orderId: order._id,
            orderStatus: cfOrder.order_status,
            paymentStatus: updatedOrder?.paymentStatus || order.paymentStatus
        });
    } catch (error: any) {
        console.error('[CASHFREE-VERIFY-ERROR]', error.response?.data || error.message || error);
        res.status(500).json({ msg: 'Failed to verify payment status' });
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
