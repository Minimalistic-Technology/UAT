"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Ticket,
  Notebook,
  TerminalSquare,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { SidebarNavItem } from "@/components/sidebar-nav-item";
import Logo from "@/components/logo";
import { useNavSession } from "@/hooks/use-nav-session";
import { useSidebar } from "@/components/ui/sidebar-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin-dashboard" },
  { label: "User Management", icon: Users, href: "/admin-dashboard/users" },
  {
    label: "KYC Applications",
    icon: ShieldCheck,
    href: "/admin-dashboard/kyc",
  },
  { label: "Coupons", icon: Ticket, href: "/admin-dashboard/coupons" },
  { label: "Plans", icon: Notebook, href: "/admin-dashboard/plans" },
  { label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  {
    label: "Feature Flags",
    icon: ToggleLeft,
    href: "/admin-dashboard/features",
  },
  {
    label: "System Settings",
    icon: Settings,
    href: "/admin-dashboard/settings",
  },
  {
    label: "DB Console",
    icon: TerminalSquare,
    href: "/admin-dashboard/db-console",
  },
];

export function Sidebar({
  className,
  forceExpanded,
}: {
  className?: string;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const { session } = useNavSession();
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { isCollapsed, toggleCollapse } = useSidebar();
  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  return (
    <div
      className={cn(
        "bg-background/80 relative flex flex-col border-r shadow-sm backdrop-blur-xl transition-all duration-300",
        effectiveCollapsed ? "w-[80px]" : "w-64",
        className,
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "border-border bg-background absolute top-5 -right-4 z-50 hidden h-8 w-8 rounded-full shadow-md lg:flex",
          effectiveCollapsed && "rotate-180",
        )}
        onClick={toggleCollapse}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        className={cn(
          "border-border/50 flex h-16 items-center border-b px-6",
          effectiveCollapsed && "justify-center px-0",
        )}
      >
        {!effectiveCollapsed ? (
          <Logo />
        ) : (
          <span className="text-primary bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border text-2xl font-bold">
            J
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                forceExpanded={forceExpanded}
              />
            );
          })}
        </nav>
      </div>

      <div className="border-border/50 bg-background/80 border-t p-4 backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors">
              <div
                className={cn(
                  "flex items-center gap-2",
                  effectiveCollapsed && "w-full justify-center",
                )}
              >
                <div className="bg-primary/20 text-primary ring-background flex size-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "SA"}
                </div>
                {!effectiveCollapsed && (
                  <div className="flex w-[130px] flex-col truncate">
                    <span className="text-foreground truncate text-sm leading-tight font-semibold">
                      {session?.user?.name || "Super Admin"}
                    </span>
                    <span className="text-muted-foreground truncate text-[10px] font-medium uppercase">
                      {session?.user?.email || "Administrator"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border z-50 mb-2 ml-4 w-[230px] bg-white dark:bg-slate-900"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {session?.user?.name || "Super Admin"}
                </p>
                <p className="text-muted-foreground text-xs leading-none break-all">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin-dashboard/profile"
                className="flex cursor-pointer items-center"
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
