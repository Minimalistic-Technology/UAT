"use client";

import { useState } from "react";
import {
    Clock,
    CheckSquare,
    Square,
    Truck,
    ArrowRight,
    Inbox,
    Activity,
    Grid
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

interface PackingViewProps {
    orders: Order[];
    isLoadingOrders: boolean;
    actionLoadingId: string | null;
    updateOrderStage: (orderId: string, status: string) => void;
}

export default function PackingView({
    orders,
    isLoadingOrders,
    actionLoadingId,
    updateOrderStage
}: PackingViewProps) {
    const packingList = orders.filter(o => o.status === "processing");
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const handleToggleCheck = (skuKey: string) => {
        setCheckedItems(prev => ({ ...prev, [skuKey]: !prev[skuKey] }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="size-5 text-amber-500 animate-pulse" />
                    Fulfillment & Packing Deck
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Mark box items as checked to complete physical shipments packaging.</p>
            </div>

            {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Activity className="size-8 text-teal-600 animate-spin" />
                    <span className="text-slate-500 font-bold text-xs">Syncing packing workspace logs...</span>
                </div>
            ) : packingList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Grid className="size-16 text-slate-300 dark:text-slate-800 mb-3" />
                    <p className="text-slate-800 dark:text-slate-300 font-black text-sm">Packing Queue Completely Clear!</p>
                    <p className="text-slate-450 dark:text-slate-500 text-xs mt-1">Pending order requests will appear here when pushed from Dashboard queue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packingList.map(order => (
                        <div key={order._id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between gap-4.5 shadow-2xs hover:shadow-xs transition-shadow">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <span className="font-mono text-xs font-black text-teal-600 dark:text-teal-400">
                                        #PACK-{order._id.substring(order._id.length - 6).toUpperCase()}
                                    </span>
                                    <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded font-black tracking-wide uppercase">
                                        Packing Active
                                    </span>
                                </div>

                                <div className="text-xs text-slate-700 dark:text-slate-300 mt-3 space-y-1">
                                    <p className="font-bold">Recipient: <span className="font-semibold text-slate-500 dark:text-slate-400">{order.shippingInfo?.fullName || "Guest"}</span></p>
                                    <p className="font-bold">Locality: <span className="font-semibold text-slate-500 dark:text-slate-400">{order.shippingInfo?.address || "N/A"}, {order.shippingInfo?.city || ""}</span></p>
                                </div>

                                <div className="mt-4 gap-2.5 flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-1">Verify tools checklist:</span>
                                    {order.items.map((item, idx) => {
                                        const skuKey = `${order._id}-${idx}`;
                                        const isPacked = checkedItems[skuKey] || false;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleToggleCheck(skuKey)}
                                                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${isPacked
                                                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 text-slate-800 dark:text-slate-200"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-slate-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {isPacked ? (
                                                        <CheckSquare className="size-4.5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                                                    ) : (
                                                        <Square className="size-4.5 text-slate-400 flex-shrink-0" />
                                                    )}
                                                    <span className="text-xs font-black truncate text-left">{item.product?.name || "Power Tool"}</span>
                                                </div>
                                                <span className="font-mono text-xs font-black text-slate-750 dark:text-slate-350 pr-1">x{item.quantity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                disabled={actionLoadingId === order._id}
                                onClick={() => updateOrderStage(order._id, "shipped")}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 dark:bg-emerald-750 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-black tracking-wide uppercase shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-none mt-2"
                            >
                                {actionLoadingId === order._id ? (
                                    <>
                                        <Activity className="size-4 animate-spin" /> Persisting tracking logs...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="size-4" /> Ready for Courier Dispatch <ArrowRight className="size-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
