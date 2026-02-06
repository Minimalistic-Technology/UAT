import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();

        // Real Stats from Orders
        const orders = await Order.find().sort({ createdAt: -1 });
        const recentOrders = orders.slice(0, 5);
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        res.json({
            users: userCount,
            products: productCount,
            revenue: totalRevenue,
            orders: totalOrders,
            recentActivity: recentOrders
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};
