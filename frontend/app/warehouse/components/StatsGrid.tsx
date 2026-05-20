"use client";

import {
    Clock,
    Truck,
    AlertTriangle,
    Bell
} from "lucide-react";

interface StatsGridProps {
    pendingCount: number;
    packingCount: number;
    dispatchedCount: number;
    lowStockCount: number;
}

export default function StatsGrid({
    pendingCount,
    packingCount,
    dispatchedCount,
    lowStockCount
}: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: New Orders */}
            <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 rounded-3xl p-5 shadow-xs flex items-center justify-between text-teal-900 dark:text-teal-200 relative overflow-hidden transition-all duration-300">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90 block">New Orders</span>
                    <span className="text-3xl font-black block mt-2 leading-none font-sans">{pendingCount}</span>
                </div>
                <div className="size-12 bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-450 border border-teal-200/50 dark:border-slate-800 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm">
                    <Bell className="size-5.5" />
                </div>
            </div>

            {/* Card 2: In Packing */}
            <div className="bg-amber-50/70 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-5 shadow-xs flex items-center justify-between text-amber-900 dark:text-amber-205 relative overflow-hidden transition-all duration-300">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90 block">In Packing</span>
                    <span className="text-3xl font-black block mt-2 leading-none font-sans">{packingCount}</span>
                </div>
                <div className="size-12 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-slate-800 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm">
                    <Clock className="size-5.5" />
                </div>
            </div>

            {/* Card 3: Dispatched Today */}
            <div className="bg-emerald-50/70 dark:bg-emerald-955/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 shadow-xs flex items-center justify-between text-emerald-900 dark:text-emerald-250 relative overflow-hidden transition-all duration-300">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90 block">Dispatched Today</span>
                    <span className="text-3xl font-black block mt-2 leading-none font-sans">{dispatchedCount}</span>
                </div>
                <div className="size-12 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-slate-800 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm">
                    <Truck className="size-5.5" />
                </div>
            </div>

            {/* Card 4: Low Stock Alerts */}
            <div className="bg-red-50/70 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 shadow-xs flex items-center justify-between text-red-900 dark:text-red-200 relative overflow-hidden transition-all duration-300">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90 block">Low Stock Alerts</span>
                    <span className="text-3xl font-black block mt-2 leading-none font-sans">{lowStockCount > 9 ? lowStockCount : `0${lowStockCount}`}</span>
                </div>
                <div className="size-12 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-slate-800 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm">
                    <AlertTriangle className="size-5.5" />
                </div>
            </div>
        </div>
    );
}
