"use client";

import { useState } from "react";
import {
    Truck,
    CheckCircle2,
    Ship,
    Gift,
    MapPin,
    Activity,
    ClipboardCheck
} from "lucide-react";

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

interface ShipmentsViewProps {
    orders: Order[];
    isLoadingOrders: boolean;
    actionLoadingId: string | null;
    updateOrderStage: (orderId: string, status: string) => void;
}

export default function ShipmentsView({
    orders,
    isLoadingOrders,
    actionLoadingId,
    updateOrderStage
}: ShipmentsViewProps) {
    const list = orders.filter(o => o.status === "shipped" || o.status === "delivered");
    const [trackingIds, setTrackingIds] = useState<Record<string, string>>({});

    const handleCreateTrackingMock = (orderId: string) => {
        if (trackingIds[orderId]) return;
        const mockCode = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setTrackingIds(prev => ({ ...prev, [orderId]: mockCode }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="size-5 text-teal-600" />
                    Shipment Logs & Dispatch Registry
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Control outgoing transport logs, complete shipping delivery receipts instantly.</p>
            </div>

            {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Activity className="size-8 text-teal-600 animate-spin" />
                    <span className="text-slate-500 font-bold text-xs">Accessing shipment registers...</span>
                </div>
            ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Ship className="size-16 text-slate-300 dark:text-slate-850 mb-3" />
                    <p className="text-slate-805 dark:text-slate-350 font-black text-sm">Dispatched Registry Empty</p>
                    <p className="text-slate-450 dark:text-slate-500 text-xs mt-1">Orders checked out of packing facility will populate here automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {list.map(order => {
                        const trk = trackingIds[order._id] || `TRK-98382${order._id.substring(order._id.length - 3)}`;
                        const firstItem = order.items[0];

                        return (
                            <div
                                key={order._id}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs hover:border-slate-300 dark:hover:border-slate-800 transition-all"
                            >
                                <div className="flex gap-4 min-w-0 flex-1">
                                    <div className="size-14 rounded-2xl overflow-hidden border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 flex items-center justify-center">
                                        <img
                                            src={firstItem?.product?.image || "/fallback.jpg"}
                                            alt={firstItem?.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-black text-slate-800 dark:text-white">
                                                #DIS-{order._id.substring(order._id.length - 6).toUpperCase()}
                                            </span>
                                            <span className="text-[9px] font-mono font-black py-0.5 px-2 bg-slate-200 dark:bg-slate-850 text-slate-655 dark:text-slate-400 rounded-md">
                                                {trk}
                                            </span>
                                        </div>
                                        <h4 className="text-xs text-slate-550 dark:text-slate-400 font-bold truncate max-w-sm mt-1">
                                            Recipient: <span className="font-extrabold text-slate-700 dark:text-slate-300">{order.shippingInfo?.fullName || "Guest"}</span>
                                        </h4>
                                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                            <MapPin className="size-3 text-slate-400" /> {order.shippingInfo?.address || "N/A"}, {order.shippingInfo?.city || ""} (Zip: {order.shippingInfo?.zip || ""})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4.5 justify-between md:justify-end border-t md:border-t-0 border-slate-200 dark:border-slate-800 pt-3.5 md:pt-0">
                                    <div className="text-left md:text-right">
                                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Release Status</span>
                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-wider leading-none shadow-xs ${order.status === "shipped"
                                            ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-205 dark:border-indigo-900/30"
                                            : "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-205 dark:border-emerald-900/30"
                                            }`}>
                                            {order.status === "shipped" ? "Transport Transit" : "Arrived"}
                                        </span>
                                    </div>

                                    <div>
                                        {order.status === "shipped" ? (
                                            <button
                                                disabled={actionLoadingId === order._id}
                                                onClick={() => updateOrderStage(order._id, "delivered")}
                                                className="px-4 py-2.5 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-[10px] tracking-wide uppercase font-black shadow-md shadow-teal-500/10 transition-all disabled:opacity-50 inline-block leading-none"
                                            >
                                                {actionLoadingId === order._id ? "Processing Receipt..." : "Deliver Package"}
                                            </button>
                                        ) : (
                                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-black flex items-center justify-end gap-1 select-none leading-none pr-2">
                                                <CheckCircle2 className="size-4" /> Transit Received
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
