import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();

        // 1. Stock Stats
        const products = await Product.find().select('stock name category');
        const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

        const lowStockProducts = await Product.find({ stock: { $gt: 0, $lt: 10 } })
            .select('name stock image images')
            .limit(10);
        const outOfStockProducts = await Product.find({ stock: 0 })
            .select('name stock image images')
            .limit(10);

        const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
        const outOfStock = products.filter(p => p.stock === 0).length;

        // 2. Upcoming Restock (Low Stock Products)
        const restockProducts = await Product.find({ stock: { $lt: 20 } })
            .sort({ stock: 1 })
            .limit(5)
            .select('name stock');

        // 3. Order Trends (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orderTrends = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const formattedTrends = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = orderTrends.find(t => t._id === dateStr);
            formattedTrends.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: found ? found.total : 0
            });
        }

        // 4. Revenue by Category (Heavy Aggregation)
        // Note: usage of any for quick fix on complex types
        const revenueByCategory = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.name",
                    value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            }
        ]);


        // 5. Recent Activity & Totals
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName email');
        const totalOrdersCount = await Order.countDocuments();
        const totalRevenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;


        // 6. Top Selling Products
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 4 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    name: "$productInfo.name",
                    totalSold: 1,
                    revenue: 1,
                    image: "$productInfo.image",
                    stock: "$productInfo.stock"
                }
            }
        ]);

        res.json({
            users: userCount,
            products: productCount,
            revenue: totalRevenue,
            orders: totalOrdersCount,
            stock: {
                totalStock,
                lowStock,
                outOfStock,
                lowStockProducts,
                outOfStockProducts
            },
            trends: formattedTrends,
            categoryRevenue: revenueByCategory.map(c => ({ name: c._id, value: c.value })),
            restock: restockProducts,
            recentActivity: orders,
            topProducts
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


