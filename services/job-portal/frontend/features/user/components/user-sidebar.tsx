"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  Bookmark,
  Settings,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarNavItem } from "@/components/sidebar-nav-item";

const userMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
  { label: "Find Jobs", icon: Search, href: "/find-jobs" },
  {
    label: "My Applications",
    icon: Briefcase,
    href: "/user-dashboard/applications",
  },
  // { label: "Saved Jobs", icon: Bookmark, href: "/user-dashboard/saved-jobs" },
  // {
  //   label: "My Resume",
  //   icon: FileText,
  //   href: "/user-dashboard/profile/resume",
  // },
  // { label: "Notifications", icon: Bell, href: "/user-dashboard/notifications" },
  // { label: "Settings", icon: Settings, href: "/user-dashboard/settings" },
];

export default function UserSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const handleLogout = () => signOut({ callbackUrl: "/login" });

  // Get initials for avatar fallback
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div
      className={cn(
        "hidden h-[calc(100vh-4rem)] w-64 flex-col border-r bg-white lg:flex",
        className,
      )}
    >
      {/* Brand Section */}
      <div className="flex gap-2 h-16 items-center border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-md bg-indigo-600">
          <User className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          User Panel
        </span>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-1">
          {userMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Section */}
      <div className="border-t bg-slate-50/50 p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border border-white shadow-sm">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900">
              {session?.user?.name || "User"}
            </span>
            <span className="truncate text-xs text-slate-500">
              {session?.user?.email}
            </span>
          </div>
        </div>

        {/* 
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="hover:text-destructive hover:bg-destructive/10 h-9 w-full justify-start text-slate-500 cursor-pointer"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
        */}
      </div>
    </div>
  );
}
