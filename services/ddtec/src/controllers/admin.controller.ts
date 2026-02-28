import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Bill from '../models/Bill';

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

        // 3. Trends (Last 7 Days) - Merge Order and Bill Trends
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [orderTrends, billTrends] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]),
            Bill.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$totalAmount" }
                    }
                }
            ])
        ]);

        // Merge trends
        const mergedTrendsMap: Record<string, number> = {};
        [...orderTrends, ...billTrends].forEach(t => {
            mergedTrendsMap[t._id] = (mergedTrendsMap[t._id] || 0) + t.total;
        });

        // Fill in missing days with 0
        const formattedTrends = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            formattedTrends.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: mergedTrendsMap[dateStr] || 0
            });
        }

        // 4. Revenue by Category (Heavy Aggregation) - Merge Order and Bill
        const [orderRevenueByCategory, billRevenueByCategory] = await Promise.all([
            Order.aggregate([
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
                { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { $ifNull: ["$categoryDetails.name", "Uncategorized"] },
                        value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                    }
                }
            ]),
            Bill.aggregate([
                { $unwind: "$items" },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.productId", // Bills use productId field
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { $ifNull: ["$categoryDetails.name", "Uncategorized"] },
                        value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                    }
                }
            ])
        ]);

        // Merge Revenue by Category
        const mergedCategoryRevenueMap: Record<string, number> = {};
        [...orderRevenueByCategory, ...billRevenueByCategory].forEach(c => {
            mergedCategoryRevenueMap[c._id] = (mergedCategoryRevenueMap[c._id] || 0) + c.value;
        });

        const finalCategoryRevenue = Object.entries(mergedCategoryRevenueMap).map(([name, value]) => ({
            name,
            value: Math.round(value)
        }));

        // 5. Recent Activity & Totals
        const [orders, bills] = await Promise.all([
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName email'),
            Bill.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName email')
        ]);

        // Merge and sort for recent activity
        const recentActivity = [...orders.map(o => ({ ...o.toObject(), type: 'order' })), ...bills.map(b => ({ ...b.toObject(), type: 'bill' }))]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);

        const [orderCount, billCount] = await Promise.all([
            Order.countDocuments(),
            Bill.countDocuments()
        ]);

        const [totalOrderRevenueResult, totalBillRevenueResult] = await Promise.all([
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Bill.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
        ]);

        const totalOrderRevenue = totalOrderRevenueResult[0]?.total || 0;
        const totalBillRevenue = totalBillRevenueResult[0]?.total || 0;
        const totalRevenue = totalOrderRevenue + totalBillRevenue;

        // 6. Top Selling Products (Merging both)
        const topProductsAggregation = async (Model: any, productField: string) => {
            return Model.aggregate([
                { $unwind: "$items" },
                {
                    $group: {
                        _id: `$items.${productField}`,
                        totalSold: { $sum: "$items.quantity" },
                        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                    }
                }
            ]);
        };

        const [orderTop, billTop] = await Promise.all([
            topProductsAggregation(Order, 'product'),
            topProductsAggregation(Bill, 'productId')
        ]);

        const topProductsMap: Record<string, any> = {};
        [...orderTop, ...billTop].filter(t => t._id).forEach(t => {
            const id = t._id.toString();
            if (!topProductsMap[id]) {
                topProductsMap[id] = { totalSold: 0, revenue: 0 };
            }
            topProductsMap[id].totalSold += t.totalSold;
            topProductsMap[id].revenue += t.revenue;
        });

        const topProductsList = Object.entries(topProductsMap)
            .sort((a, b) => b[1].totalSold - a[1].totalSold)
            .slice(0, 4);

        const topProductsInfo = await Promise.all(topProductsList.map(async ([id, stats]) => {
            const product = await Product.findById(id).select('name image stock');
            return {
                name: product?.name || 'Unknown Product',
                totalSold: stats.totalSold,
                revenue: stats.revenue,
                image: product?.image,
                stock: product?.stock
            };
        }));

        res.json({
            users: userCount,
            products: productCount,
            revenue: Math.round(totalRevenue),
            orders: orderCount + billCount,
            stock: {
                totalStock,
                lowStock,
                outOfStock,
                lowStockProducts,
                outOfStockProducts
            },
            trends: formattedTrends,
            categoryRevenue: finalCategoryRevenue,
            restock: restockProducts,
            recentActivity: recentActivity,
            topProducts: topProductsInfo
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


