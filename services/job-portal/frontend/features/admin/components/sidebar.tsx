"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  ToggleLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { SidebarNavItem } from "@/components/sidebar-nav-item"
import Logo from "@/components/logo"
import { useNavSession } from "@/hooks/use-nav-session"
import { useSidebar } from "@/components/ui/sidebar-context"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin-dashboard" },
  { label: "User Management", icon: Users, href: "/admin-dashboard/users" },
  { label: "KYC Applications", icon: ShieldCheck, href: "/admin-dashboard/kyc" },
  { label: "Coupons", icon: Ticket, href: "/admin-dashboard/coupons" },
  { label: "Plans", icon: Notebook, href: "/admin-dashboard/plans" },
  { label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  { label: "Feature Flags", icon: ToggleLeft, href: "/admin-dashboard/features" },
  { label: "System Settings", icon: Settings, href: "/admin-dashboard/settings" },
  { label: "DB Console", icon: TerminalSquare, href: "/admin-dashboard/db-console" },
]

export function Sidebar({ className, forceExpanded }: { className?: string; forceExpanded?: boolean }) {
  const pathname = usePathname();
  const { session } = useNavSession();
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { isCollapsed, toggleCollapse } = useSidebar();
  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  return (
    <div className={cn("flex flex-col border-r bg-background/80 backdrop-blur-xl shadow-sm transition-all duration-300 relative", effectiveCollapsed ? "w-[80px]" : "w-64", className)}>
      <Button
        variant="outline"
        size="icon"
        className={cn("absolute -right-4 top-5 h-8 w-8 rounded-full border-border bg-background shadow-md z-50 hidden lg:flex", effectiveCollapsed && "rotate-180")}
        onClick={toggleCollapse}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className={cn("flex h-16 items-center px-6 border-b border-border/50", effectiveCollapsed && "justify-center px-0")}>
        {!effectiveCollapsed ? (
          <Logo />
        ) : (
          <span className="font-bold text-2xl text-primary bg-primary/10 w-10 h-10 flex items-center justify-center rounded-xl border border-primary/20">
            J
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                forceExpanded={forceExpanded}
              />
            )
          })}
        </nav>
      </div>

      <div className="border-t border-border/50 p-4 bg-background/80 backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className={cn("flex items-center gap-2", effectiveCollapsed && "justify-center w-full")}>
                <div className="size-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "SA"}
                </div>
                {!effectiveCollapsed && (
                  <div className="flex flex-col truncate w-[130px]">
                    <span className="text-sm font-semibold text-foreground leading-tight truncate">{session?.user?.name || "Super Admin"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium truncate">{session?.user?.email || "Administrator"}</span>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[230px] ml-4 mb-2 bg-white dark:bg-slate-900 border-border z-50">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{session?.user?.name || "Super Admin"}</p>
                <p className="text-muted-foreground text-xs leading-none break-all">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin-dashboard/profile" className="flex cursor-pointer items-center">
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
  )
}