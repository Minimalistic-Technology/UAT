"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Layers, X, Users, Truck, ShoppingBag, Loader2 } from "lucide-react";
import api from "@/lib/api";
import DeliveredOrdersGraph from "../components/DeliveredOrdersGraph";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";
import { useAdminStats } from "../hooks/useAdminStats";
import { useOrders } from "../hooks/useOrders";

export default function OrdersPage() {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const { stats, fetchStats } = useAdminStats();
    const { ordersList, setOrdersList, loadingOrders, fetchOrders } = useOrders();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrdersList(prev => prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update order status", "error");
        }
    };

    const handleEditOrderClick = (order: any) => {
        setEditingOrder({
            ...order,
            fullName: order.shippingInfo?.fullName || "",
            address: order.shippingInfo?.address || "",
            city: order.shippingInfo?.city || "",
            pincode: order.shippingInfo?.pincode || order.shippingInfo?.zip || "",
            phone: order.shippingInfo?.phone || ""
        });
        setIsEditOrderModalOpen(true);
    };

    const handleUpdateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updateData = {
                status: editingOrder.status,
                shippingInfo: {
                    fullName: editingOrder.fullName,
                    address: editingOrder.address,
                    city: editingOrder.city,
                    pincode: editingOrder.pincode,
                    phone: editingOrder.phone
                }
            };
            const res = await api.put(`/orders/${editingOrder._id}`, updateData);
            setOrdersList(prev => prev.map(o => o._id === editingOrder._id ? res.data : o));
            setIsEditOrderModalOpen(false);
            showToast("Order updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this order?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/orders/${orderId}`);
            setOrdersList(prev => prev.filter(o => o._id !== orderId));
            showToast("Order deleted successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to delete order", "error");
        }
    };

    return (
        <>
            <div className="space-y-8">
                <DeliveredOrdersGraph deliveredStats={stats?.deliveredStats} allOrders={ordersList} />
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                        <span className="text-sm text-slate-500">{ordersList.length} Total Orders</span>
                    </div>
                    <div className="overflow-x-auto">
                        {loadingOrders ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="animate-spin text-teal-600 size-10" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Order ID / Date</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {ordersList.map(order => (
                                        <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <div className="font-mono text-xs uppercase text-slate-900 dark:text-white">#{order._id.slice(-8)}</div>
                                                <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{order.shippingInfo?.fullName || "Guest"}</div>
                                                <div className="text-xs text-slate-400">{order.user?.email || 'Guest'}</div>
                                            </td>
                                            <td className="p-4 text-slate-900 dark:text-white font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                    className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border-none cursor-pointer
                                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}
                                                >
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => handleEditOrderClick(order)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                    title="Edit Order"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Layers className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* View Order Modal */}
            <AnimatePresence>
                {viewingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                                    <p className="text-sm text-slate-500">#{viewingOrder._id}</p>
                                </div>
                                <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Status & Date */}
                                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${viewingOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : viewingOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {viewingOrder.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Date</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Customer & Shipping */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Users className="size-4" /> Customer Details
                                        </h4>
                                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                            <p><span className="font-medium text-slate-900 dark:text-white">Name:</span> {viewingOrder.shippingInfo?.fullName || 'N/A'}</p>
                                            <p><span className="font-medium text-slate-900 dark:text-white">Email:</span> {viewingOrder.shippingInfo?.email || 'N/A'}</p>
                                            <p><span className="font-medium text-slate-900 dark:text-white">Phone:</span> {viewingOrder.shippingInfo?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Truck className="size-4" /> Shipping Address
                                        </h4>
                                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                            <p>{viewingOrder.shippingInfo?.address || 'N/A'}</p>
                                            <p>{viewingOrder.shippingInfo?.city || 'N/A'}, {viewingOrder.shippingInfo?.pincode || viewingOrder.shippingInfo?.zip || ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <ShoppingBag className="size-4" /> Ordered Items
                                    </h4>
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                                                <tr>
                                                    <th className="p-3 font-medium">Product</th>
                                                    <th className="p-3 font-medium text-center">Qty</th>
                                                    <th className="p-3 font-medium text-right">Price</th>
                                                    <th className="p-3 font-medium text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {viewingOrder.items.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                {item.product?.image ? (
                                                                    <img src={item.product?.image} alt={item.product?.name} className="size-10 rounded-lg object-cover bg-slate-100" />
                                                                ) : (
                                                                    <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">IMG</div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                                                                    <p className="text-xs text-slate-400">ID: {item.product?._id || item.product}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">₹{item.price.toLocaleString()}</td>
                                                        <td className="p-3 text-right font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Payment & Totals */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Payment Method</span>
                                        <span className="font-bold text-slate-900 dark:text-white uppercase">{viewingOrder.paymentMethod}</span>
                                    </div>
                                    {viewingOrder.coupon && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Coupon Applied</span>
                                            <span className="font-medium text-teal-600">{viewingOrder.coupon}</span>
                                        </div>
                                    )}
                                    {viewingOrder.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Discount</span>
                                            <span className="font-medium text-green-600">-₹{viewingOrder.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                        <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                                        <span className="text-2xl font-bold text-teal-600">₹{viewingOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => setViewingOrder(null)}
                                    className="w-full px-4 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Order Modal */}
            <AnimatePresence>
                {isEditOrderModalOpen && editingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Order Details</h3>
                                <button onClick={() => setIsEditOrderModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateOrder} className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                        <select
                                            value={editingOrder.status}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        >
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editingOrder.fullName}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, fullName: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                        <textarea
                                            value={editingOrder.address}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[100px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={editingOrder.city}
                                                onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                                            <input
                                                type="text"
                                                value={editingOrder.pincode}
                                                onChange={(e) => setEditingOrder({ ...editingOrder, pincode: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={editingOrder.phone}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOrderModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
