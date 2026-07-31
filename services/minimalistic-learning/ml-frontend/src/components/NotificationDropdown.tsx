"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Check,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial fast load on page load ONLY
    fetchNotifications(true);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");

      // Auto-remove shown notifications from dropdown after 6 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }, 6000);
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearAllNotifications = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your notification history?",
      )
    )
      return;
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
      setNotifications((prev) =>
        prev.map((n) => ((n.id || n._id) === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Seen karne ke baad thodi der me auto-disappear from UI (6 seconds)
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => (n.id || n._id) !== id));
      }, 6000);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post_deleted":
        return <Trash2 className="text-red-500" size={16} />;
      case "post_approved":
        return <CheckCircle className="text-green-500" size={16} />;
      case "post_rejected":
        return <XCircle className="text-orange-500" size={16} />;
      default:
        return <Info className="text-theme-action" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const opening = !isOpen;
          setIsOpen(opening);
          if (opening) fetchNotifications(true);
        }}
        className="bg-theme-element-sec border-theme-accent/20 text-foreground/70 hover:text-foreground hover:bg-theme-element relative flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="border-background animate-in zoom-in absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-red-500 text-[10px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-theme-element border-theme-accent/20 animate-in fade-in zoom-in-95 absolute right-0 z-[120] mt-3 w-80 overflow-hidden rounded-3xl border py-0 shadow-2xl duration-200 sm:w-96">
          {/* Header */}
          <div className="border-theme-accent/10 bg-theme-element-sec flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-foreground text-sm font-black tracking-wider uppercase">
              Notifications
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-theme-action text-[10px] font-black tracking-widest uppercase hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] font-black tracking-widest text-red-500 uppercase hover:underline"
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
                <div className="bg-theme-element-sec text-foreground/30 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Bell size={24} />
                </div>
                <p className="text-foreground/50 text-sm font-bold">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const notifId = n.id || n._id;
                return (
                  <div
                    key={notifId}
                    onClick={() => !n.isRead && markAsRead(notifId)}
                    className={`border-theme-accent/10 flex cursor-pointer gap-4 border-b px-5 py-4 transition-colors last:border-0 ${n.isRead ? "bg-theme-element opacity-60" : "bg-theme-action/5 hover:bg-theme-action/10"}`}
                  >
                    <div
                      className={`border-theme-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${n.isRead ? "bg-theme-element-sec" : "bg-theme-element"}`}
                    >
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-foreground truncate text-sm font-black ${n.isRead ? "font-bold" : ""}`}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div className="bg-theme-action h-2 w-2 shrink-0 rounded-full" />
                        )}
                      </div>
                      <p className="text-foreground/70 mt-0.5 line-clamp-2 text-xs leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <div className="text-foreground/50 mt-2 flex items-center gap-2 text-[10px] font-bold tracking-tight uppercase">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-theme-accent/10 bg-theme-element-sec border-t px-5 py-3 text-center">
            <p className="text-foreground/40 text-[9px] font-black tracking-[0.2em] uppercase">
              Platform Notifications System
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
