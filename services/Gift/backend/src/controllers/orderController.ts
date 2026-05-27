import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';
import SharedLink from '../models/SharedLink';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sharedLinkId, employeeName, employeeEmail, employeeId, address, notes, selectedProducts } = req.body;

        if (!sharedLinkId || !employeeName || !employeeEmail || !employeeId || !address || !selectedProducts || selectedProducts.length === 0) {
            res.status(400).json({ error: 'Please fulfill all required fields and select at least one product' });
            return;
        }

        const link = await SharedLink.findById(sharedLinkId);
        if (!link) {
            res.status(404).json({ error: 'Shared link template not found' });
            return;
        }

        const newOrder = new Order({
            sharedLinkId,
            employeeName,
            employeeEmail,
            employeeId,
            address,
            notes,
            selectedProducts,
            submittedBy: req.user._id,
            hrId: link.adminId,
            status: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ success: true, message: 'Order submitted safely', order: newOrder });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find()
            .populate('sharedLinkId')
            .populate('selectedProducts')
            .populate('submittedBy', 'name email')
            .populate('hrId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getHROrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ hrId: req.user._id })
            .populate('sharedLinkId')
            .populate('selectedProducts')
            .populate('submittedBy', 'name email')
            .populate('hrId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ submittedBy: req.user._id })
            .populate('sharedLinkId')
            .populate('selectedProducts')
            .populate('hrId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Shipped', 'Rejected', 'Cancelled'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const order = await Order.findById(id);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: 'Order status updated successfully', order });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
