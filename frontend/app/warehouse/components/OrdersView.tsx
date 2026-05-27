"use client";

import { useState } from "react";
import {
    Search,
    ChevronDown,
    FileText,
    Clock,
    Truck,
    CheckCircle,
    SlidersHorizontal,
    Activity,
    MapPin,
    X,
    Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
    _id: string;
    items: {
        product: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: string;
    shippingInfo: {
        fullName: string;
        email: string;
        address: string;
        city: string;
        zip: string;
    };
    createdAt: string;
}

interface OrdersViewProps {
    orders: Order[];
    isLoadingOrders: boolean;
    actionLoadingId: string | null;
    updateOrderStage: (orderId: string, status: string) => void;
}

export default function OrdersView({
    orders,
    isLoadingOrders,
    actionLoadingId,
    updateOrderStage
}: OrdersViewProps) {
    const [selectedStatusTab, setSelectedStatusTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [addressModalData, setAddressModalData] = useState<Order['shippingInfo'] | null>(null);

    const filtered = orders.filter(o => {
        const matchesStatus = selectedStatusTab === "all" || o.status === selectedStatusTab;
        const matchesSearch =
            o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.shippingInfo?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.items.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/30";
            case "processing":
                return "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30";
            case "shipped":
                return "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30";
            case "delivered":
                return "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/55 dark:border-emerald-900/30";
            default:
                return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            {/* Header section with Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="size-5 text-teal-600" />
                        Shipments Manager
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Track, pack, and release whole warehouse orders in real-time.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 size-3.5" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium placeholder-slate-450"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs Panel */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                {[
                    { id: "all", label: "All Orders", count: orders.length },
                    { id: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
                    { id: "processing", label: "Packing Queue", count: orders.filter(o => o.status === "processing").length },
                    { id: "shipped", label: "Dispatched", count: orders.filter(o => o.status === "shipped").length },
                    { id: "delivered", label: "Delivered", count: orders.filter(o => o.status === "delivered").length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedStatusTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedStatusTab === tab.id
                            ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200/50"
                            : "text-slate-550 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850"
                            }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${selectedStatusTab === tab.id
                            ? "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Shipments List Queue Table */}
            <div className="flex-1 overflow-x-auto">
                {isLoadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <Activity className="size-8 text-teal-600 animate-spin" />
                        <span className="text-slate-500 font-bold text-xs">Syncing real-time shipment list...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Inbox className="size-12 text-slate-350 dark:text-slate-700 mb-3" />
                        <p className="text-slate-800 dark:text-slate-300 font-black text-sm">No Orders Found</p>
                        <p className="text-slate-450 dark:text-slate-500 text-xs mt-1">Try resetting the status filter or search parameters.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th className="pb-3.5 pl-2 font-black">Order ID</th>
                                <th className="pb-3.5 font-black">Receiver Detail</th>
                                <th className="pb-3.5 font-black">Address View</th>
                                <th className="pb-3.5 font-black">Fulfillment Product</th>
                                <th className="pb-3.5 text-center font-black">Quantity</th>
                                <th className="pb-3.5 text-center font-black">Status</th>
                                <th className="pb-3.5 text-right font-black pr-2">Action Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/50">
                            {filtered.map((order) => {
                                const firstItem = order.items[0];
                                const totalQty = order.items.reduce((acc, it) => acc + it.quantity, 0);

                                return (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all">
                                        <td className="py-4 pl-2 font-mono text-xs font-black text-teal-600 dark:text-teal-400 hover:underline cursor-pointer select-none">
                                            #ORD-{order._id.substring(order._id.length - 6).toUpperCase()}
                                        </td>
                                        <td className="py-4">
                                            <div className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[130px]">
                                                {order.shippingInfo?.fullName || "Guest Customer"}
                                            </div>
                                            <div className="text-[10px] text-slate-450 dark:text-slate-500 leading-none truncate max-w-[130px] mt-0.5">
                                                {order.shippingInfo?.email || "Guest Email"}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <button
                                                onClick={() => setAddressModalData(order.shippingInfo)}
                                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
                                            >
                                                <MapPin className="size-3" /> View Address
                                            </button>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 flex-shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={firstItem?.product?.image || "/fallback.jpg"}
                                                        alt={firstItem?.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 text-left">
                                                    <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[130px] sm:max-w-[200px]" title={firstItem?.product?.name}>
                                                        {firstItem?.product?.name || "Premium Item"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5 truncate tracking-wide">
                                                        {order.items.length > 1 ? `+ ${order.items.length - 1} other items` : "Shipment Unit"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                                            {totalQty < 10 ? `0${totalQty}` : totalQty}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider leading-none shadow-xs ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            {order.status === "pending" && (
                                                <button
                                                    disabled={actionLoadingId === order._id}
                                                    onClick={() => updateOrderStage(order._id, "processing")}
                                                    className="px-4 py-2 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-[10px] tracking-wide uppercase font-black shadow-md shadow-teal-500/10 transition-all disabled:opacity-50 inline-block leading-none"
                                                >
                                                    {actionLoadingId === order._id ? "Packing..." : "Move to Packing"}
                                                </button>
                                            )}
                                            {order.status === "processing" && (
                                                <button
                                                    disabled={actionLoadingId === order._id}
                                                    onClick={() => updateOrderStage(order._id, "shipped")}
                                                    className="px-4 py-2 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-650 text-white rounded-xl text-[10px] tracking-wide uppercase font-black shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50 inline-block leading-none"
                                                >
                                                    {actionLoadingId === order._id ? "Shipping..." : "Mark as Dispatched"}
                                                </button>
                                            )}
                                            {order.status === "shipped" && (
                                                <button
                                                    disabled={actionLoadingId === order._id}
                                                    onClick={() => updateOrderStage(order._id, "delivered")}
                                                    className="px-4 py-2 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-[10px] tracking-wide uppercase font-black shadow-md shadow-teal-500/10 transition-all disabled:opacity-50 inline-block leading-none"
                                                >
                                                    {actionLoadingId === order._id ? "Delivering..." : "Deliver Package"}
                                                </button>
                                            )}
                                            {order.status === "delivered" && (
                                                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-black flex items-center justify-end gap-1 select-none leading-none">
                                                    <CheckCircle className="size-3.5" /> Fulfilled
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Address Modal Popup with Framer Motion */}
            <AnimatePresence>
                {addressModalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setAddressModalData(null)}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] shadow-2xl drop-shadow-2xl p-6 w-full max-w-sm relative"
                        >
                            <button
                                onClick={() => setAddressModalData(null)}
                                className="absolute top-4 right-4 p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                                title="Close"
                            >
                                <X className="size-4" />
                            </button>
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-850 pb-4">
                                <div className="size-10 rounded-full bg-teal-100/50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                                    <MapPin className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none">Destination</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Shipping Details</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Recipient Name</span>
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{addressModalData.fullName || "Guest Customer"}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Delivery Locality</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border-l-[3px] border-teal-500">
                                        {addressModalData.address || "N/A"}<br />
                                        <span className="opacity-70 mt-1 block">{addressModalData.city || ""} — {addressModalData.zip || ""}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
