"use client";

import {
    Activity,
    Inbox,
    CheckCircle,
    ChevronDown
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

interface OrdersTableProps {
    orders: Order[];
    isLoadingOrders: boolean;
    actionLoadingId: string | null;
    updateOrderStage: (orderId: string, status: string) => void;
}

export default function OrdersTable({
    orders,
    isLoadingOrders,
    actionLoadingId,
    updateOrderStage
}: OrdersTableProps) {
    return (
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-5 min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recent Pending Orders</h3>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">Shipments needing verification and packing processing.</p>
                </div>
                <span className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-550 dark:text-slate-450 font-bold flex items-center gap-1 cursor-pointer select-none">
                    Columns <ChevronDown className="size-3" />
                </span>
            </div>

            {/* Orders Queue Table layout */}
            <div className="flex-1 overflow-x-auto">
                {isLoadingOrders ? (
                    <div className="h-full flex items-center justify-center py-20">
                        <Activity className="size-7 text-teal-605 dark:text-teal-450 animate-spin mr-2" />
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">Synchronizing shipment logs...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <Inbox className="size-16 text-slate-300 dark:text-slate-750 mb-4" />
                        <p className="text-slate-805 dark:text-slate-350 font-black text-sm mb-1">Fulfillment Queue Empty</p>
                        <p className="text-slate-500 dark:text-slate-500 text-xs max-w-xs leading-relaxed">Incoming customer pending shipments cataloged correctly will populate here automatically.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th className="pb-3.5 pl-2 font-black">Order ID</th>
                                <th className="pb-3.5 font-black">Product Details</th>
                                <th className="pb-3.5 text-center font-black">Quantity</th>
                                <th className="pb-3.5 text-center font-black">Status</th>
                                <th className="pb-3.5 text-right font-black pr-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/50">
                            {orders.slice(0, 10).map((order) => {
                                const firstItem = order.items[0];
                                const itemQuantity = order.items.reduce((acc, it) => acc + it.quantity, 0);

                                // Dynamic status pill styles matching mockup
                                let statusBg = "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-405 border border-yellow-205 dark:border-yellow-900/30";
                                let statusLabel = "Pending";
                                if (order.status === "processing") {
                                    statusBg = "bg-orange-50 dark:bg-orange-955/20 text-orange-700 dark:text-orange-400 border border-orange-205 dark:border-orange-900/30";
                                    statusLabel = "Packing";
                                } else if (order.status === "shipped") {
                                    statusBg = "bg-indigo-55/60 dark:bg-indigo-955/20 text-indigo-750 dark:text-indigo-400 border border-indigo-205 dark:border-indigo-900/30";
                                    statusLabel = "Dispatched";
                                } else if (order.status === "delivered") {
                                    statusBg = "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 border border-emerald-205 dark:border-emerald-900/30";
                                    statusLabel = "Delivered";
                                }

                                return (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all">
                                        {/* Order ID Teal colored mock code */}
                                        <td className="py-4 pl-2 font-mono text-[12px] font-black text-teal-600 dark:text-teal-450 hover:underline cursor-pointer select-none">
                                            #ORD-{order._id.substring(order._id.length - 4).toUpperCase()}
                                        </td>
                                        {/* Product details thumbnail slot */}
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex-shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={firstItem?.product?.image || "/fallback.jpg"}
                                                        alt={firstItem?.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 text-left">
                                                    <p className="text-xs font-black text-slate-805 dark:text-white truncate max-w-[130px] sm:max-w-[200px]" title={firstItem?.product?.name}>
                                                        {firstItem?.product?.name || "Premium Item"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5 truncate max-w-[130px] tracking-wide">
                                                        {order.items.length > 1 ? `+ ${order.items.length - 1} other items` : "Shipment Unit"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Quantity padded */}
                                        <td className="py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                                            {itemQuantity < 10 ? `0${itemQuantity}` : itemQuantity}
                                        </td>
                                        {/* Status Pill Badge */}
                                        <td className="py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider leading-none shadow-xs ${statusBg}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        {/* Button action matching active stage precisely */}
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
                                                    className="px-4 py-2 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-[10px] tracking-wide uppercase font-black shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50 inline-block leading-none"
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
        </div>
    );
}
