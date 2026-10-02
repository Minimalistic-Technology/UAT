"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import StatCard from "./components/StatCard";
import DeliveredOrdersGraph from "./components/DeliveredOrdersGraph";
import PurchasesGraph from "./components/PurchasesGraph";
import { useAdminStats } from "./hooks/useAdminStats";
import { useOrders } from "./hooks/useOrders";
import { useProducts } from "./hooks/useProducts";
import { formatDate } from "@/lib/utils";

// Maps the old `/admin?view=xxx` query-param scheme to its real route, so
// existing bookmarks/links keep working.
const LEGACY_VIEW_REDIRECTS: Record<string, string> = {
    products: "/admin/products",
    users: "/admin/users",
    orders: "/admin/orders",
    inventory: "/admin/inventory",
    messages: "/admin/messages",
    coupons: "/admin/coupons",
    blogs: "/admin/blogs",
    categories: "/admin/categories",
    settings: "/admin/settings",
    dynamic_routes: "/admin/dynamic-routes",
    quotation_products: "/admin/quotation-products",
    create_quotation: "/admin/create-quotation",
    saved_quotations: "/admin/saved-quotations",
    schedule_mail: "/admin/schedule-mail",
    contacts: "/admin/contacts",
    leads: "/admin/leads",
    clients: "/admin/clients",
    company: "/admin/company",
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { stats, fetchStats } = useAdminStats();
    const { ordersList, fetchOrders } = useOrders();
    const { productsList, fetchProducts } = useProducts();

    useEffect(() => {
        const legacyView = searchParams?.get("view");
        if (legacyView && LEGACY_VIEW_REDIRECTS[legacyView]) {
            router.replace(LEGACY_VIEW_REDIRECTS[legacyView]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        fetchStats();
        fetchOrders();
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats?.users || 0}
                    icon={<Users className="size-6 text-blue-600" />}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.products || 0}
                    icon={<Package className="size-6 text-teal-600" />}
                    bg="bg-teal-50 dark:bg-teal-900/20"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.orders || 0}
                    icon={<ShoppingBag className="size-6 text-purple-600" />}
                    bg="bg-purple-50 dark:bg-purple-900/20"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(stats?.revenue || 0).toLocaleString()}`}
                    icon={<DollarSign className="size-6 text-green-600" />}
                    bg="bg-green-50 dark:bg-green-900/20"
                />
            </div>

            {/* Orders & Purchases Analytics Graphs */}
            <div className="space-y-8 mb-8">
                <DeliveredOrdersGraph deliveredStats={stats?.deliveredStats} allOrders={ordersList} />
                <PurchasesGraph products={productsList} />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((order) => (
                                <div key={order._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="size-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                        <ShoppingBag className="size-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">Order placed by {order.shippingInfo?.fullName || "Guest"}</p>
                                        <p className="text-sm text-slate-500">
                                            ₹{order.totalAmount.toFixed(2)} - {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500">No recent activity.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/products" className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group block">
                            <Package className="size-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-slate-900 dark:text-white block">Manage Products</span>
                        </Link>
                        <Link href="/admin/users" className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group block">
                            <Users className="size-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-slate-900 dark:text-white block">Manage Users</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
