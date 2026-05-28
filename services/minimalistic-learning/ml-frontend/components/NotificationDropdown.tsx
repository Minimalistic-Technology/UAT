"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Trash2, CheckCircle, XCircle, Info, Check, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");

      // Auto-remove shown notifications from dropdown after 6 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => !n.isRead));
      }, 6000);
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear your notification history?")) return;
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notification history cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n.id || n._id) === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Seen karne ke baad thodi der me auto-disappear from UI (6 seconds)
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
      }, 6000);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post_deleted": return <Trash2 className="text-red-500" size={16} />;
      case "post_approved": return <CheckCircle className="text-green-500" size={16} />;
      case "post_rejected": return <XCircle className="text-orange-500" size={16} />;
      default: return <Info className="text-theme-action" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-theme-element-sec border border-theme-accent/20 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-theme-element transition-all shadow-sm"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-theme-element rounded-3xl shadow-2xl border border-theme-accent/20 py-0 z-[120] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-theme-accent/10 flex items-center justify-between bg-theme-element-sec">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-theme-action hover:underline uppercase tracking-widest"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 bg-theme-element-sec rounded-full flex items-center justify-center mx-auto mb-3 text-foreground/30">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-bold text-foreground/50">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const notifId = n.id || n._id;
                return (
                  <div
                    key={notifId}
                    onClick={() => !n.isRead && markAsRead(notifId)}
                    className={`px-5 py-4 flex gap-4 transition-colors cursor-pointer border-b border-theme-accent/10 last:border-0 ${n.isRead ? 'opacity-60 bg-theme-element' : 'bg-theme-action/5 hover:bg-theme-action/10'}`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-theme-accent/10 ${n.isRead ? 'bg-theme-element-sec' : 'bg-theme-element'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-black text-foreground truncate ${n.isRead ? 'font-bold' : ''}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <div className="w-2 h-2 bg-theme-action rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-foreground/70 mt-0.5 line-clamp-2 leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-foreground/50 uppercase tracking-tight">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-theme-accent/10 bg-theme-element-sec text-center">
            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">Platform Notifications System</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
