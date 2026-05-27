"use client";

import { useState } from "react";
import {
    TrendingUp,
    Download,
    Printer,
    BarChart3,
    PieChart,
    Activity,
    ShieldCheck,
    CheckCircle
} from "lucide-react";

interface ReportsViewProps {
    ordersCount: number;
    dispatchedCount: number;
    lowStockCount: number;
}

export default function ReportsView({
    ordersCount,
    dispatchedCount,
    lowStockCount
}: ReportsViewProps) {
    const [exporting, setExporting] = useState(false);
    const [exportDone, setExportDone] = useState(false);

    const handleExportMock = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            setExportDone(true);
            setTimeout(() => setExportDone(false), 3000);
        }, 1500);
    };

    const mockDistribution = [
        { status: "Dispatched", percentage: 76, color: "bg-teal-500" },
        { status: "Packing In Progress", percentage: 15, color: "bg-amber-500" },
        { status: "Pending Verification", percentage: 9, color: "bg-rose-500" }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="size-5 text-teal-605" />
                        Operational Analytics & Reports
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Physical warehouse throughput analysis, fulfillment rates report worksheets.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportMock}
                        disabled={exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 dark:bg-teal-700 hover:bg-teal-750 dark:hover:bg-teal-650 text-white rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-xs leading-none"
                    >
                        {exporting ? (
                            <Activity className="size-3.5 animate-spin" />
                        ) : exportDone ? (
                            <CheckCircle className="size-3.5" />
                        ) : (
                            <Download className="size-3.5" />
                        )}
                        {exportDone ? "Downloaded!" : "Export CSV"}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-2 border border-slate-205 dark:border-slate-850 text-slate-655 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/20 text-xs"
                        title="Print logistics list"
                    >
                        <Printer className="size-4" />
                    </button>
                </div>
            </div>

            {/* KPI Banner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl p-4.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Total Facility Orders</span>
                    <span className="text-2xl font-black text-slate-805 dark:text-white block mt-1.5 font-mono">{ordersCount} Units</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold block mt-1">↑ 100% System Synchronized</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl p-4.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Packing Efficiency Rate</span>
                    <span className="text-2xl font-black text-slate-805 dark:text-white block mt-1.5 font-mono">98.4 %</span>
                    <span className="text-[10px] text-teal-605 dark:text-teal-400 font-bold block mt-1">Avg packing latency: ~8.4mins</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl p-4.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Operational Safety Clear</span>
                    <span className="text-2xl font-black text-slate-805 dark:text-white block mt-1.5 flex items-center gap-1.5 leading-none">
                        100 % Safe <ShieldCheck className="size-5 text-emerald-500" />
                    </span>
                    <span className="text-[10px] text-teal-650 dark:text-teal-400 font-bold block mt-1">All catalog units safe in lockers</span>
                </div>
            </div>

            {/* Simulated Graphical Chart block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 text-left flex flex-col gap-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                            <TrendingUp className="size-4 text-teal-600" /> Facility Daily Shipment Volume
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-1">Outgoing dispatch frequency logs over the past week.</p>
                    </div>

                    {/* Highly aesthetic CSS Bar Chart */}
                    <div className="h-44 flex items-end gap-3 px-2 pt-4 border-b border-l border-slate-202 dark:border-slate-800 font-mono">
                        {[
                            { day: "Mon", val: 30, h: "h-[30%]" },
                            { day: "Tue", val: 55, h: "h-[55%]" },
                            { day: "Wed", val: 40, h: "h-[40%]" },
                            { day: "Thu", val: 65, h: "h-[65%]" },
                            { day: "Fri", val: 85, h: "h-[85%]" },
                            { day: "Sat", val: 20, h: "h-[20%]" },
                            { day: "Sun", val: 95, h: "h-[95%]" }
                        ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <div className="absolute -top-6 text-[8px] bg-slate-900 border border-slate-700 text-white rounded px-1 font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                                    {bar.val}
                                </div>
                                <div className={`w-full ${bar.h} bg-gradient-to-t from-teal-600 to-teal-400 group-hover:to-teal-305 rounded-t-md transition-all shadow-inner cursor-pointer`} />
                                <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 mt-2 block font-sans shrink-0">
                                    {bar.day}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-slate-202 dark:border-slate-850 rounded-2xl p-5 text-left flex flex-col justify-between gap-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                            <PieChart className="size-4 text-amber-500" /> Shipment Phase Split Ratio
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-1">Current relative concentration of database records states.</p>
                    </div>

                    <div className="space-y-3.5 py-2">
                        {mockDistribution.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-sans font-black text-slate-700 dark:text-slate-350">{item.status}</span>
                                    <span className="font-mono font-black text-slate-500">{item.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden flex shadow-inner">
                                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
