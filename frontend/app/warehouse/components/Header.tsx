"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import {
    Search,
    Menu,
    Bell,
    ChevronDown,
    Sun,
    Moon,
    CheckCheck,
    BellOff,
    CheckCircle
} from "lucide-react";

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    isRead: boolean;
}

interface HeaderProps {
    user: {
        firstName?: string;
        lastName?: string;
    };
    activeTab: string;
    orderSearch: string;
    setOrderSearch: (val: string) => void;
    productSearch: string;
    setProductSearch: (val: string) => void;
    setIsMobileSidebarOpen: (open: boolean) => void;
    notifications: NotificationItem[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export default function Header({
    user,
    activeTab,
    orderSearch,
    setOrderSearch,
    productSearch,
    setProductSearch,
    setIsMobileSidebarOpen,
    notifications,
    setNotifications
}: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Handle clicking outside to close
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userFirstName = user?.firstName || "Warehouse";
    const userLastName = user?.lastName || "Operator";
    const firstInitial = userFirstName.substring(0, 1).toUpperCase();
    const lastInitial = userLastName.substring(0, 1).toUpperCase();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleToggleRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-800/80 px-6 py-4 sticky top-0 z-20 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                {/* Hamburger menu for responsive views */}
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="md:hidden p-2 rounded-xl border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                    <Menu className="size-5" />
                </button>

                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-black text-teal-600 dark:text-teal-400 leading-none font-sans">Warehouse Panel</h2>

                        {/* Manager Profile Active user indicator pill in center of header */}
                        <div className="bg-slate-100 dark:bg-slate-850 border border-slate-250 dark:border-slate-750/80 rounded-full py-1 px-3 flex items-center gap-2 shadow-sm shrink-0">
                            <div className="size-5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                <div className="size-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[9px] flex items-center justify-center">
                                    {firstInitial}{lastInitial}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Manager: {userFirstName} {userLastName}</span>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-550"></span>
                            </span>
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide leading-none">Active</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-550 font-black uppercase mt-1 tracking-widest block font-sans">Warehouse ID: 123456789</span>
                </div>
            </div>

            {/* Actions controls header area */}
            <div className="flex items-center gap-4.5">
                {/* Search Input bar */}
                <div className="relative hidden lg:block w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={activeTab === "orders" ? orderSearch : productSearch}
                        onChange={(e) => activeTab === "orders" ? setOrderSearch(e.target.value) : setProductSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-805 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium placeholder-slate-400"
                    />
                </div>

                {/* Theme Switcher Toggle button right inside dashboard */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="size-9 border border-slate-205 dark:border-slate-850 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/20 dark:hover:bg-slate-955/40 rounded-full flex items-center justify-center text-slate-655 dark:text-slate-400 transition-all shadow-xs"
                        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    >
                        {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    </button>
                )}

                {/* Notification Bell Badge and floating Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`size-9 border ${showDropdown ? 'border-teal-500 text-teal-600' : 'border-slate-200 dark:border-slate-850'} bg-slate-50 hover:bg-slate-100 dark:bg-slate-955/20 dark:hover:bg-slate-950/40 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all relative`}
                        title="Alert logs"
                    >
                        <Bell className="size-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-4.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none border border-white dark:border-slate-900 shadow-md animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Popover Dropdown details (under 60 lines) */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-3.5 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-30 transition-all text-left">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">Live Shipments Notifications</span>
                                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">{unreadCount} active unread events</span>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[9px] font-black uppercase text-teal-600 hover:text-teal-700 flex items-center gap-1 leading-none py-1 px-2 rounded-lg border border-teal-200/40 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                    >
                                        <CheckCheck className="size-3" /> Clear All
                                    </button>
                                )}
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850/80">
                                {notifications.length === 0 ? (
                                    <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
                                        <BellOff className="size-8 text-slate-300 dark:text-slate-700" />
                                        <span className="text-xs text-slate-400 font-bold">Workspace Alert tray clear!</span>
                                    </div>
                                ) : (
                                    notifications.map(item => (
                                        <div
                                            key={item.id}
                                            className={`p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors flex justify-between items-start gap-2.5 cursor-pointer ${!item.isRead ? 'bg-teal-50/10 dark:bg-teal-950/5 border-l-[3.5px] border-teal-500' : 'pl-4'}`}
                                            onClick={(e) => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n))}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-slate-805 dark:text-white tracking-wide truncate">{item.title}</span>
                                                    {!item.isRead && (
                                                        <span className="size-1.5 rounded-full bg-teal-500 inline-block block shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-sans" title={item.description}>
                                                    {item.description}
                                                </p>
                                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 mt-1.5 block font-mono">{item.time}</span>
                                            </div>

                                            <button
                                                onClick={(e) => handleToggleRead(item.id, e)}
                                                className={`p-1 rounded-md text-slate-350 hover:text-slate-655 dark:hover:text-slate-400 ${item.isRead ? 'text-teal-600' : ''}`}
                                                title={item.isRead ? "Mark as unread" : "Mark as read"}
                                            >
                                                <CheckCircle className="size-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profiles active switcher control */}
                <div className="flex items-center gap-2 border-l border-slate-205 dark:border-slate-800 pl-4">
                    <div className="size-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 flex items-center justify-center cursor-pointer flex-shrink-0">
                        <div className="size-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-xs flex items-center justify-center shadow-inner">
                            {firstInitial}
                        </div>
                    </div>
                    <span className="text-xs font-black text-slate-705 dark:text-slate-300 hidden sm:inline whitespace-nowrap">{userFirstName} {userLastName.substring(0, 1)}.</span>
                    <ChevronDown className="size-3 text-slate-400 cursor-pointer" />
                </div>
            </div>
        </header>
    );
}
