import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Bill from '../models/Bill';
import WarehouseStock from '../models/WarehouseStock';
import RouteConfig from '../models/RouteConfig';
import NotificationService from '../services/notification.service';
import CashfreeService from '../services/cashfree.service';

// Creates the Bill record and dispatches order confirmation to User & payment notification to Admin.
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

    const populatedOrder = await Order.findById(orderId).populate('items.product').populate('user', 'name email');
    if (populatedOrder) {
        // 1. Send Order Confirmation + Bill invoice PDF to User
        NotificationService.sendOrderConfirmation(populatedOrder).catch(err => {
            console.error('[ORDER-USER-EMAIL-ERROR] Failed to send user confirmation:', err);
        });

        // 2. Send Payment / New Order notification alert to Admin
        NotificationService.sendAdminPaymentNotification(populatedOrder).catch(err => {
            console.error('[ORDER-ADMIN-EMAIL-ERROR] Failed to send admin payment notification:', err);
        });
    }
};

// Restores stock for an order whose payment failed/expired/dropped or was cancelled.
const restockOrderItems = async (order: any) => {
    for (const item of order.items) {
        const productId = item.product?._id || item.product;
        const product = await Product.findById(productId);
        if (product) {
            product.stock += item.quantity;
            product.lastInventoryUpdate = new Date();
            await product.save();

            // Also restore to physical WarehouseStock location (primary rack)
            try {
                const existingRack = await WarehouseStock.findOne({ product: productId });
                if (existingRack) {
                    existingRack.quantity += item.quantity;
                    await existingRack.save();
                } else {
                    const newRack = new WarehouseStock({
                        product: productId,
                        productName: product.name,
                        warehouseName: 'Main Warehouse',
                        zoneAisle: 'Zone A',
                        rack: 'R1',
                        shelfRow: 'Row 1',
                        quantity: item.quantity,
                        capacity: 100
                    });
                    await newRack.save();
                }
            } catch (whErr) {
                console.warn('Warehouse rack stock restore error (non-fatal):', whErr);
            }
        }
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

        // Pre-validate stock availability for all items before decrementing
        for (const item of items) {
            const productId = item.product?._id || item.product;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ msg: `Product not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ msg: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` });
            }
        }

        const orderData: any = {
            items: items.map((item: any) => ({
                product: item.product?._id || item.product,
                quantity: item.quantity,
                price: item.product?.price ?? item.price
            })),
            totalAmount,
            shippingInfo,
            paymentMethod,
            status: isOnlinePayment ? 'pending' : 'processing', // Online stays pending until payment confirmed; COD/Credit start processing
            coupon: req.body.coupon,
            discountAmount: req.body.discountAmount || 0,
            // COD is settled on delivery; credit is deducted instantly below; Cashfree starts pending until gateway confirms
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

        // Decrement Stock in Product and WarehouseStock
        for (const item of items) {
            const productId = item.product?._id || item.product;
            const product = await Product.findById(productId);
            if (product) {
                product.stock -= item.quantity;
                product.lastInventoryUpdate = new Date();
                await product.save();

                // Deduct from WarehouseStock rack locations (FIFO across racks)
                try {
                    let qtyToDeduct = item.quantity;
                    const rackStocks = await WarehouseStock.find({ product: productId }).sort({ quantity: -1 });
                    for (const rack of rackStocks) {
                        if (qtyToDeduct <= 0) break;
                        if (rack.quantity <= qtyToDeduct) {
                            qtyToDeduct -= rack.quantity;
                            await WarehouseStock.findByIdAndDelete(rack._id);
                        } else {
                            rack.quantity -= qtyToDeduct;
                            await rack.save();
                            qtyToDeduct = 0;
                        }
                    }
                } catch (whErr) {
                    console.warn('Warehouse rack stock decrement error (non-fatal):', whErr);
                }
            }
        }

        const savedOrder = await order.save();

        if (isOnlinePayment) {
            // Online payment: create the Cashfree order and hand paymentSessionId back
            // to the frontend so it can launch hosted checkout. Bill + confirmation email are
            // dispatched once payment success is confirmed (see applyCashfreeOrderStatus).
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
        order.status = 'processing';
        order.cashfree = { ...(order.cashfree || {}), cfPaymentId, lastEvent: 'PAID' };
        await order.save();
        await finalizeOrder(order._id.toString());
    } else if (cfOrderStatus === 'EXPIRED' || cfOrderStatus === 'TERMINATED' || cfOrderStatus === 'FAILED') {
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
        // Ack with 200 to avoid excessive gateway retries once logged; state can also be fetched via verify endpoint
        res.status(200).json({ msg: 'Webhook received with processing error' });
    }
};

// Called by the frontend's return_url page right after redirect back from Cashfree hosted checkout.
// Fetches authoritative status directly from Cashfree.
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

// Get all orders (Admin only)
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

// Get current user's orders (User History)
export const getMyOrders = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user?.id;
        const userEmail = req.user?.email;

        const query: any = {
            $or: [
                { user: userId },
                ...(userEmail ? [{ 'shippingInfo.email': new RegExp(`^${userEmail.trim()}$`, 'i') }] : [])
            ]
        };

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ msg: 'Server error fetching orders' });
    }
};

// Update Order Status (Admin / Warehouse Only)
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        const prevStatus = existingOrder.status;

        // If status becomes cancelled and wasn't cancelled before, restock inventory items
        if (status === 'cancelled' && prevStatus !== 'cancelled') {
            await restockOrderItems(existingOrder);
        }

        existingOrder.status = status;
        const updatedOrder = await existingOrder.save();

        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate('user', 'name email')
            .populate('items.product');

        // Send Email Alert for order status update to User
        if (populatedOrder) {
            NotificationService.sendOrderStatusUpdate(populatedOrder, status).catch(err => {
                console.error('[EMAIL-ERROR] Failed to send order status update:', err);
            });
        }

        res.json(populatedOrder || updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update Order (Admin only)
export const updateOrder = async (req: Request, res: Response) => {
    try {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        const prevStatus = existingOrder.status;
        const newStatus = req.body.status;

        // If status changed to cancelled and wasn't cancelled before, restock items
        if (newStatus && newStatus === 'cancelled' && prevStatus !== 'cancelled') {
            await restockOrderItems(existingOrder);
        }

        Object.assign(existingOrder, req.body);
        const savedOrder = await existingOrder.save();

        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('user', 'name email')
            .populate('items.product');

        // Send notification to user if order status changed
        if (populatedOrder && newStatus && newStatus !== prevStatus) {
            NotificationService.sendOrderStatusUpdate(populatedOrder, newStatus).catch(err => {
                console.error('[EMAIL-ERROR] Failed to send order update notification:', err);
            });
        }

        res.json(populatedOrder || savedOrder);
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

