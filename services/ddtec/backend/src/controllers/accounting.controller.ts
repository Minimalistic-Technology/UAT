import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

export const getAccountingDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all orders (revenue) that are not cancelled or failed
        const orders = await Order.find({ status: { $nin: ['cancelled', 'Failed'] } });
        // Fetch all expenses (outflow)
        const expenses = await Expense.find();

        let totalRevenue = 0;
        orders.forEach(o => { totalRevenue += o.totalAmount || 0; });

        let totalExpenses = 0;
        expenses.forEach(e => { totalExpenses += e.amount || 0; });

        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

        // Group cashflow by month
        const monthlyData: Record<string, { revenue: number, expense: number }> = {};

        orders.forEach(o => {
            const date = new Date(o.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expense: 0 };
            monthlyData[key].revenue += o.totalAmount || 0;
        });

        expenses.forEach(e => {
            const date = new Date(e.date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expense: 0 };
            monthlyData[key].expense += e.amount || 0;
        });

        const cashflowChart = Object.keys(monthlyData).map(key => ({
            month: key,
            revenue: monthlyData[key].revenue,
            expense: monthlyData[key].expense,
            profit: monthlyData[key].revenue - monthlyData[key].expense
        })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        res.status(200).json({
            stats: {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin: Number(profitMargin),
                activeInvoices: orders.filter(o => o.status === 'pending').length
            },
            cashflowChart
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching accounting dashboard', error: error.message });
    }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
    try {
        const expenses = await Expense.find().sort({ date: -1 }).populate('createdBy', 'firstName lastName email');
        res.status(200).json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

export const addExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, amount, category, date, receiptUrl } = req.body;
        const user = (req as any).user;

        const newExpense = new Expense({
            title,
            description,
            amount,
            category,
            date: date || new Date(),
            receiptUrl,
            createdBy: user._id
        });

        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error: any) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExpense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.status(200).json({ message: 'Expense updated', expense: updatedExpense });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

export const getLedger = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ status: { $nin: ['cancelled', 'Failed'] } }).select('_id totalAmount createdAt status');
        const expenses = await Expense.find().select('_id title amount date category');

        const ledger: any[] = [];

        orders.forEach(o => {
            ledger.push({
                id: o._id,
                type: 'inflow',
                title: `Order #${o._id.toString().slice(-6)}`,
                amount: o.totalAmount,
                date: o.createdAt,
                status: o.status === 'pending' ? 'Pending' : 'Completed'
            });
        });

        expenses.forEach(e => {
            ledger.push({
                id: e._id,
                type: 'outflow',
                title: e.title,
                category: e.category,
                amount: e.amount,
                date: e.date,
                status: 'Paid'
            });
        });

        ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.status(200).json(ledger);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching ledger', error: error.message });
    }
};

export const getProductEconomics = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ status: { $nin: ['cancelled', 'Failed'] } }).populate('items.product');
        const productStats: Record<string, any> = {};

        orders.forEach(order => {
            order.items.forEach((item: any) => {
                if (!item.product || !item.product._id) return;
                const pid = item.product._id.toString();
                if (!productStats[pid]) {
                    productStats[pid] = {
                        id: pid,
                        name: item.product.name,
                        mrp: item.product.price,
                        costPrice: item.product.costPrice || 0,
                        unitsSold: 0,
                        totalRevenue: 0,
                        totalCOGS: 0
                    };
                }
                productStats[pid].unitsSold += item.quantity;
                productStats[pid].totalRevenue += (item.quantity * item.price);
                productStats[pid].totalCOGS += (item.quantity * (item.product.costPrice || 0));
            });
        });

        const economics = Object.values(productStats).map(p => {
            const grossProfit = p.totalRevenue - p.totalCOGS;
            const margin = p.totalRevenue > 0 ? ((grossProfit / p.totalRevenue) * 100).toFixed(2) : 0;
            return {
                ...p,
                grossProfit,
                margin: Number(margin)
            };
        }).sort((a, b) => b.unitsSold - a.unitsSold);

        res.status(200).json(economics);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching product economics', error: error.message });
    }
};

export const getUserFinancials = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find().populate('user', 'firstName lastName email creditBalance');
        const userStats: Record<string, any> = {};

        orders.forEach(order => {
            if (!order.user || !(order.user as any)._id) return;
            const uid = (order.user as any)._id.toString();

            if (!userStats[uid]) {
                userStats[uid] = {
                    id: uid,
                    name: `${(order.user as any).firstName || ''} ${(order.user as any).lastName || ''}`.trim() || (order.user as any).email,
                    email: (order.user as any).email,
                    creditBalance: (order.user as any).creditBalance || 0,
                    totalSpent: 0,
                    pendingDues: 0,
                    orderCount: 0
                };
            }

            userStats[uid].orderCount += 1;

            if (order.status !== 'cancelled' && order.status !== 'Failed') {
                userStats[uid].totalSpent += (order.totalAmount || 0);
                if (order.status === 'pending') {
                    userStats[uid].pendingDues += (order.totalAmount || 0);
                }
            }
        });

        const financials = Object.values(userStats).sort((a, b) => b.totalSpent - a.totalSpent);
        res.status(200).json(financials);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching user financials', error: error.message });
    }
};
