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
  { label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  { label: "Coupons", icon: Ticket, href: "/admin-dashboard/coupons" },
  { label: "Plans", icon: Notebook, href: "/admin-dashboard/plans" },
  { label: "Feature Flags", icon: ToggleLeft, href: "/admin-dashboard/features" },
  { label: "System Settings", icon: Settings, href: "/admin-dashboard/settings" },
  { label: "DB Console", icon: TerminalSquare, href: "/admin-dashboard/db-console" },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { session } = useNavSession();
  const handleLogout = () => signOut({ callbackUrl: "/login" });

  return (
    <div className={cn("fixed left-0 top-0 bottom-0 min-h-screen w-64 flex-col border-r bg-background/80 backdrop-blur-xl hidden lg:flex shadow-sm z-40", className)}>
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Logo />
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
              />
            )
          })}
        </nav>
      </div>

      <div className="border-t border-border/50 p-4 bg-background/80 backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "SA"}
                </div>
                <div className="flex flex-col truncate w-[130px]">
                  <span className="text-sm font-semibold text-foreground leading-tight truncate">{session?.user?.name || "Super Admin"}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium truncate">{session?.user?.email || "Administrator"}</span>
                </div>
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
              <Link href="/profile" className="flex cursor-pointer items-center">
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