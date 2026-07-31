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
            <aside className={`fixed inset-y-0 left-0 z-[60] w-64 pt-20 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/50 shadow-2xl drop-shadow-xl transition-all duration-300 transform md:translate-x-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>

                {/* Mobile Close Button Container */}
                <div className="md:hidden p-4 border-0 flex justify-end">
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-slate-455 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Navigation Links list */}
                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
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
                <div className="p-4 border-0 mt-2">
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
                />
            )}
        </>
    );
}
