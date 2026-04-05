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
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
  { label: "Find Jobs", icon: Search, href: "/jobs" },
  { label: "My Applications", icon: Briefcase, href: "/user-dashboard/applications", badge: "4" },
  { label: "Saved Jobs", icon: Bookmark, href: "/user-dashboard/saved-jobs" },
  { label: "My Resume", icon: FileText, href: "/user-dashboard/profile/resume" },
  { label: "Notifications", icon: Bell, href: "/user-dashboard/notifications", badge: "2" },
  { label: "Settings", icon: Settings, href: "/user-dashboard/settings" },
];

export default function UserSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Get initials for avatar fallback
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className={cn(
      "h-[calc(100vh-4rem)] w-64 flex-col border-r bg-white hidden lg:flex", 
      className
    )}>
      {/* Brand Section */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-indigo-600 flex items-center justify-center">
            <User className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            User Panel
          </span>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {userMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors", 
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Section */}
      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <Avatar className="h-9 w-9 border border-white shadow-sm">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {session?.user?.name || "User"}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {session?.user?.email}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="w-full justify-start text-slate-500 hover:text-destructive hover:bg-destructive/10 h-9"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}