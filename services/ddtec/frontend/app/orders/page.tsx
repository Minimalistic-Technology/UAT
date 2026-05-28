"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    Clock,
    CheckCircle,
    ChevronRight,
    ShoppingBag,
    Loader2,
    X,
    Truck,
    MapPin,
    Calendar,
    CreditCard,
    DollarSign,
    Check,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingInfo?: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
    };
    paymentMethod?: string;
    coupon?: string;
    discountAmount?: number;
    createdAt: string;
}

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my-orders');
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) fetchOrders();
    }, [user, loading, router]);

    // Live background polling (every 8 seconds) so customer sees status state change live if admin updates it!
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            fetchOrders();
        }, 8000);
        return () => clearInterval(interval);
    }, [user]);

    // Maintain modal data consistency if orders collection updates in background
    useEffect(() => {
        if (viewingOrder) {
            const updated = orders.find(o => o._id === viewingOrder._id);
            if (updated) {
                setViewingOrder(updated);
            }
        }
    }, [orders, viewingOrder]);

    if (loading || isFetching) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-teal-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-bold tracking-wide">Syncing purchase registers...</span>
                </div>
            </div>
        );
    }

    // Helper: Determine Stepper Node Status
    const getStepStatus = (
        orderStatus: Order['status'],
        step: 'placed' | 'processing' | 'shipped' | 'delivered'
    ) => {
        if (orderStatus === 'cancelled') return 'inactive';

        const stages = ['placed', 'processing', 'shipped', 'delivered'];
        const currentIdx = stages.indexOf(orderStatus === 'pending' ? 'placed' : orderStatus);
        const stepIdx = stages.indexOf(step);

        if (currentIdx > stepIdx) return 'completed';
        if (currentIdx === stepIdx) return 'active';
        return 'upcoming';
    };

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-10 text-9xl opacity-5 dark:opacity-[0.02] rotate-12">📦</div>
                <div className="absolute bottom-1/4 right-10 text-9xl opacity-5 dark:opacity-[0.02] -rotate-12">🏷️</div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">My Orders</h1>
                        <p className="text-sm text-slate-500 font-medium">Track shipping transit records and purchase history</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl border border-slate-202/50 dark:border-slate-800/80 text-center"
                    >
                        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-405">
                            <ShoppingBag className="size-10 text-teal-605" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No orders placed yet</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm">
                            It seems your shopping cart is waiting for premium tool purchases. Start exploring our high-fidelity workspace gear!
                        </p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-teal-500/30"
                        >
                            Explore Hand & Power Tools
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-850 hover:shadow-lg hover:border-teal-500/20 dark:hover:border-teal-500/20 transition-all overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-605">
                                                <Package className="size-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                                                <p className="font-bold text-slate-900 dark:text-white font-mono text-sm uppercase">#{order._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="text-left md:text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchased On</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 capitalize shadow-sm",
                                                order.status === 'delivered' && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/20",
                                                order.status === 'shipped' && "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-250 dark:border-indigo-900/20",
                                                order.status === 'processing' && "bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-250 dark:border-sky-900/20",
                                                order.status === 'cancelled' && "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-250 dark:border-red-900/20",
                                                order.status === 'pending' && "bg-amber-55/60 dark:bg-amber-950/20 text-amber-705 dark:text-amber-400 border border-amber-250 dark:border-amber-900/20"
                                            )}>
                                                {order.status === 'delivered' ? <CheckCircle className="size-3.5" /> : <Clock className="size-3.5" />}
                                                {order.status === 'processing' ? 'packing' : order.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products list snapshot */}
                                    <div className="space-y-3">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors">
                                                <div className="size-14 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex-shrink-0">
                                                    <img src={item.product?.image || "/fallback.jpg"} alt={item.product?.name} className="w-full h-full object-contain p-1" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{item.product?.name || "Premium Workspace Gear"}</h4>
                                                    <p className="text-xs text-slate-450 dark:text-slate-400 font-bold">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-sm text-teal-600 dark:text-teal-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-slate-105 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Total</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => setViewingOrder(order)}
                                            className="flex items-center gap-2 text-sm font-black text-teal-650 dark:text-teal-450 hover:text-teal-700 dark:hover:text-teal-400 transition-colors border-b-2 border-transparent hover:border-teal-500/30 pb-0.5"
                                        >
                                            View Details & Live Tracking <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium details + live tracker popup */}
            <AnimatePresence>
                {viewingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 zoom-in-50">
                                <div className="text-left">
                                    <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-450 tracking-wider">Real-time Tracker Log</span>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase mt-0.5">Order #{viewingOrder._id.slice(-8)}</h3>
                                </div>
                                <button
                                    onClick={() => setViewingOrder(null)}
                                    className="p-1 px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-xl text-slate-550 dark:text-slate-400 transition-all font-black text-xs flex items-center gap-1.5"
                                >
                                    Close <X className="size-4" />
                                </button>
                            </div>

                            {/* Scrollable Contents */}
                            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                                {/* 🚚 LIVE REAL-TIME STEPPER TRACKER */}
                                <div className="bg-slate-50 dark:bg-slate-955 p-6 rounded-2xl border border-slate-205 dark:border-slate-850">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-6 text-left">Live Shipment Progress</h4>

                                    {viewingOrder.status === 'cancelled' ? (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-205 rounded-xl text-left">
                                            <AlertCircle className="size-6 text-red-550 flex-shrink-0 animate-bounce" />
                                            <div>
                                                <p className="text-sm font-bold text-red-750 dark:text-red-405">Order Cancelled</p>
                                                <p className="text-xs text-red-505 mt-0.5">This transaction has been voided. Please contact support desk if this was an error.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6 relative pl-3.5">
                                            {/* Stepper Vertical Track */}
                                            <div className="absolute left-6.5 top-3.5 bottom-3.5 w-[2px] bg-slate-200 dark:bg-slate-800 z-0" />

                                            {/* Node 1: Placed */}
                                            <div className="flex gap-4.5 relative z-10 text-left">
                                                <div className={cn(
                                                    "size-8 rounded-full flex items-center justify-center border font-bold text-xs flex-shrink-0 transition-all",
                                                    getStepStatus(viewingOrder.status, 'placed') === 'completed' && "bg-emerald-600 border-emerald-600 text-white",
                                                    getStepStatus(viewingOrder.status, 'placed') === 'active' && "bg-teal-50 border-teal-650 text-teal-650 dark:bg-teal-900/30 animate-pulse",
                                                    getStepStatus(viewingOrder.status, 'placed') === 'upcoming' && "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                                                )}>
                                                    <Check className="size-4.5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Order Receipt Verified</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Payment transaction log confirmed. Packaging deck notified.</p>
                                                </div>
                                            </div>

                                            {/* Node 2: Packaging */}
                                            <div className="flex gap-4.5 relative z-10 text-left">
                                                <div className={cn(
                                                    "size-8 rounded-full flex items-center justify-center border font-bold text-xs flex-shrink-0 transition-all",
                                                    getStepStatus(viewingOrder.status, 'processing') === 'completed' && "bg-emerald-600 border-emerald-600 text-white",
                                                    getStepStatus(viewingOrder.status, 'processing') === 'active' && "bg-teal-50 border-teal-500 text-teal-505 dark:bg-teal-900/30 animate-pulse",
                                                    getStepStatus(viewingOrder.status, 'processing') === 'upcoming' && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                                                )}>
                                                    {getStepStatus(viewingOrder.status, 'processing') === 'completed' ? (
                                                        <Check className="size-4.5" />
                                                    ) : getStepStatus(viewingOrder.status, 'processing') === 'active' ? (
                                                        <Loader2 className="size-4 animate-spin text-teal-605" />
                                                    ) : (
                                                        <Package className="size-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        getStepStatus(viewingOrder.status, 'processing') === 'upcoming' ? "text-slate-400" : "text-slate-900 dark:text-white"
                                                    )}>Packing & Fulfillment Deck</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {getStepStatus(viewingOrder.status, 'processing') === 'completed' && "Physical toolsets boxed and tagged with tracking logs."}
                                                        {getStepStatus(viewingOrder.status, 'processing') === 'active' && "Fulfillment operators box-packing items for courier handover."}
                                                        {getStepStatus(viewingOrder.status, 'processing') === 'upcoming' && "Awaiting allocation queue slots."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Node 3: Dispatched */}
                                            <div className="flex gap-4.5 relative z-10 text-left">
                                                <div className={cn(
                                                    "size-8 rounded-full flex items-center justify-center border font-bold text-xs flex-shrink-0 transition-all",
                                                    getStepStatus(viewingOrder.status, 'shipped') === 'completed' && "bg-emerald-600 border-emerald-600 text-white",
                                                    getStepStatus(viewingOrder.status, 'shipped') === 'active' && "bg-teal-50 border-teal-505 text-teal-505 dark:bg-teal-900/30 animate-pulse",
                                                    getStepStatus(viewingOrder.status, 'shipped') === 'upcoming' && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-405"
                                                )}>
                                                    {getStepStatus(viewingOrder.status, 'shipped') === 'completed' ? (
                                                        <Check className="size-4.5" />
                                                    ) : getStepStatus(viewingOrder.status, 'shipped') === 'active' ? (
                                                        <Loader2 className="size-4 animate-spin text-teal-505" />
                                                    ) : (
                                                        <Truck className="size-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        getStepStatus(viewingOrder.status, 'shipped') === 'upcoming' ? "text-slate-405" : "text-slate-900 dark:text-white"
                                                    )}>Dispatched & Outbound Transport</p>
                                                    <p className="text-xs text-slate-505 mt-0.5">
                                                        {getStepStatus(viewingOrder.status, 'shipped') === 'completed' && "Handover completed. Courier vehicles departed toward destination."}
                                                        {getStepStatus(viewingOrder.status, 'shipped') === 'active' && "Departed warehouse sorting hub. Live outbound logistics active."}
                                                        {getStepStatus(viewingOrder.status, 'shipped') === 'upcoming' && "Handover awaiting courier vehicle slot."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Node 4: Delivered */}
                                            <div className="flex gap-4.5 relative z-10 text-left">
                                                <div className={cn(
                                                    "size-8 rounded-full flex items-center justify-center border font-bold text-xs flex-shrink-0 transition-all",
                                                    getStepStatus(viewingOrder.status, 'delivered') === 'completed' && "bg-emerald-600 border-emerald-600 text-white",
                                                    getStepStatus(viewingOrder.status, 'delivered') === 'active' && "bg-teal-50 border-teal-505 text-teal-505 dark:bg-teal-900/30",
                                                    getStepStatus(viewingOrder.status, 'delivered') === 'upcoming' && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400"
                                                )}>
                                                    {getStepStatus(viewingOrder.status, 'delivered') === 'completed' ? (
                                                        <CheckCircle className="size-4.5 text-white" />
                                                    ) : (
                                                        <MapPin className="size-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        getStepStatus(viewingOrder.status, 'delivered') === 'upcoming' ? "text-slate-400" : "text-slate-900 dark:text-white"
                                                    )}>Arrived & Delivered</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {getStepStatus(viewingOrder.status, 'delivered') === 'completed' && "Logistics confirmed package successfully dropped at recipient address."}
                                                        {getStepStatus(viewingOrder.status, 'delivered') === 'upcoming' && "Awaiting local transport sorting."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Recipient Details Card */}
                                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl flex flex-col gap-3.5 border border-slate-150 dark:border-slate-850/80 text-left">
                                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                            <Calendar className="size-4 text-teal-650" />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Logistics Metadata</span>
                                        </div>
                                        <div className="space-y-2 text-xs font-semibold text-slate-655 dark:text-slate-400">
                                            <p><span className="text-slate-405 block font-bold text-[9px] uppercase tracking-wider">Recipient Name</span> {viewingOrder.shippingInfo?.fullName || "Guest Customer"}</p>
                                            <p><span className="text-slate-405 block font-bold text-[9px] uppercase tracking-wider">Contact Email</span> {viewingOrder.shippingInfo?.email || "Guest"}</p>
                                            <p><span className="text-slate-450 block font-bold text-[9px] uppercase tracking-wider">Contact Phone</span> {viewingOrder.shippingInfo?.phone || "N/A"}</p>
                                        </div>
                                    </div>

                                    {/* Address Details Card */}
                                    <div className="bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl flex flex-col gap-3.5 border border-slate-150 dark:border-slate-850/80 text-left">
                                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                            <MapPin className="size-4 text-teal-650" />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Drop Location</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-450 font-bold">
                                            <p className="text-slate-850 dark:text-slate-350">{viewingOrder.shippingInfo?.address || "Remote Location"}</p>
                                            <p>{viewingOrder.shippingInfo?.city || ""}, {viewingOrder.shippingInfo?.zip || ""}</p>
                                            <div className="pt-2">
                                                <span className="text-[8px] bg-teal-150 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-black px-2 py-0.5 rounded uppercase">Verified Locality</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Breakdown */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 text-left">Purchased Toolkits</h4>

                                    <div className="space-y-2 border border-slate-105 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
                                        {viewingOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/30 dark:bg-slate-900/30">
                                                <div className="flex items-center gap-3.5 min-w-0 text-left">
                                                    <div className="size-11 rounded-lg bg-white dark:bg-slate-950 border p-1 overflow-hidden flex-shrink-0 animate-fade">
                                                        <img src={item.product?.image || "/fallback.jpg"} alt={item.product?.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{item.product?.name || "Power Toolkit"}</p>
                                                        <p className="text-[10px] text-slate-450 font-medium">Quantity: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-xs font-black text-teal-650 dark:text-teal-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Financial Sheet Breakdown */}
                                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-205 dark:border-slate-850 text-left space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-205 dark:border-slate-800 pb-2 justify-between flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="size-4 text-teal-650" />
                                            <span className="text-[10px] font-black uppercase text-slate-505 tracking-wider">Financial Manifest</span>
                                        </div>
                                        <span className="text-[9px] font-black py-0.5 px-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-450 rounded-md font-mono uppercase">
                                            Payment: {viewingOrder.paymentMethod || "card"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-400 font-mono">
                                        <div className="flex justify-between font-sans">
                                            <span>Subtotal Price</span>
                                            <span>₹{(viewingOrder.totalAmount + (viewingOrder.discountAmount || 0)).toFixed(2)}</span>
                                        </div>

                                        {viewingOrder.discountAmount ? (
                                            <div className="flex justify-between text-green-605 dark:text-green-400 font-sans">
                                                <span>Coupon Discount ({viewingOrder.coupon || "Applied"})</span>
                                                <span>-₹{viewingOrder.discountAmount.toFixed(2)}</span>
                                            </div>
                                        ) : null}

                                        <div className="flex justify-between border-t border-slate-205 dark:border-slate-800 pt-2 font-black text-sm text-slate-900 dark:text-white font-sans">
                                            <span>Net Total Paid</span>
                                            <span className="text-teal-650 dark:text-teal-400">₹{viewingOrder.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
