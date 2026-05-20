"use client";

import {
    LayoutDashboard,
    Boxes,
    Clock,
    Truck,
    LogOut,
    Activity,
    Settings,
    FileText,
    X
} from "lucide-react";

interface SidebarProps {
    sidebarActiveItem: string;
    setSidebarActiveItem: (item: string) => void;
    pendingCount: number;
    packingCount: number;
    lowStockCount: number;
    logout: () => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
    sidebarActiveItem,
    setSidebarActiveItem,
    pendingCount,
    packingCount,
    lowStockCount,
    logout,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
}: SidebarProps) {

    const sidebarItems = [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Orders", icon: FileText, count: pendingCount },
        { label: "Inventory", icon: Boxes, count: lowStockCount },
        { label: "Packing", icon: Clock, count: packingCount },
        { label: "Shipments", icon: Truck },
        { label: "Reports", icon: Activity },
        { label: "Settings", icon: Settings }
    ];

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-205 dark:border-slate-800 transition-all duration-300 transform md:translate-x-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
                {/* Brand Header */}
                <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20 flex-shrink-0">
                            D
                        </div>
                        <div>
                            <span className="font-sans font-black text-slate-900 dark:text-white text-base leading-none block">DDTEC</span>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-wider uppercase block mt-1">Warehouse Hub</span>
                        </div>
                    </div>
                    {/* Close Mobile Sidebar */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-455 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Navigation Links list */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = sidebarActiveItem === item.label;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setSidebarActiveItem(item.label);
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${isActive ?
                                    "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-l-[3px] border-teal-600 dark:border-teal-500 shadow-sm" :
                                    "text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`size-4.5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isActive ? "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer block of sidebar */}
                <div className="p-4 border-t border-slate-150 dark:border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-sans"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="size-4.5" />
                            <span>Sign Out</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Backboard shadow for Mobile sidebar */}
            {isMobileSidebarOpen && (
                <div
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-25 md:hidden"
                />
            )}
        </>
    );
}
