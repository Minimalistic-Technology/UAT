"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Menu, Bell, CheckCheck, BellOff, CheckCircle } from "lucide-react";

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    isRead: boolean;
}

interface HeaderProps {
    user: any;
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
    activeTab,
    orderSearch,
    setOrderSearch,
    productSearch,
    setProductSearch,
    setIsMobileSidebarOpen,
    notifications,
    setNotifications
}: HeaderProps) {
    const [mounted, setMounted] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleToggleRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    if (!mounted) return null;

    const target = document.getElementById("warehouse-nav-portal-target");
    if (!target) return null;

    return createPortal(
        <>
            {/* Hamburger menu for responsive views (Warehouse Sidebar) */}
            <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-full text-slate-655 dark:text-slate-350 hover:bg-black/5 dark:hover:bg-white/10"
                title="Warehouse Menu"
            >
                <Menu className="size-5" />
            </button>

            {/* Search Input bar */}
            <div className="relative hidden md:block w-40 lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={activeTab === "orders" ? orderSearch : productSearch}
                    onChange={(e) => activeTab === "orders" ? setOrderSearch(e.target.value) : setProductSearch(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-medium placeholder-slate-400"
                />
            </div>

            {/* Notification Bell Badge and floating Dropdown */}
            <div className="relative z-50 flex items-center" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`p-2 rounded-full transition-colors relative hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200`}
                    title="Alert logs"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none border-2 border-white dark:border-slate-900 shadow-sm">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Popover Dropdown details */}
                {showDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all text-left">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">Live Alerts</span>
                                <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">{unreadCount} unread</span>
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

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 scrollbar-hide">
                            {notifications.length === 0 ? (
                                <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
                                    <BellOff className="size-8 text-slate-300 dark:text-slate-700" />
                                    <span className="text-xs text-slate-400 font-bold">Workspace cleared!</span>
                                </div>
                            ) : (
                                notifications.map(item => (
                                    <div
                                        key={item.id}
                                        className={`p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex justify-between items-start gap-2.5 cursor-pointer ${!item.isRead ? 'bg-teal-50/10 dark:bg-teal-900/10 border-l-[3px] border-teal-500' : 'pl-4'}`}
                                        onClick={(e) => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n))}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black text-slate-800 dark:text-white tracking-wide truncate">{item.title}</span>
                                                {!item.isRead && (
                                                    <span className="size-1.5 rounded-full bg-teal-500 inline-block block shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-sans line-clamp-2" title={item.description}>
                                                {item.description}
                                            </p>
                                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 mt-1.5 block font-mono">{item.time}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handleToggleRead(item.id, e)}
                                            className={`p-1 rounded-md text-slate-300 hover:text-slate-600 dark:hover:text-slate-400 ${item.isRead ? 'text-teal-600' : ''}`}
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
        </>,
        target
    );
}
