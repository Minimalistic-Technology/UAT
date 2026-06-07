"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Search,
  Briefcase,
  User as UserIcon,
  LogOut,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarNavItem } from "@/components/sidebar-nav-item"
import Logo from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export const userMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
  { label: "Find Jobs", icon: Search, href: "/user-dashboard/find-jobs" },
  { label: "My Applications", icon: Briefcase, href: "/user-dashboard/applications" },
]

export default function UserSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { data: session } = useSession();

  const userDetails = session?.user;

  return (
    <div className={cn("flex flex-col border-r bg-background/80 backdrop-blur-xl shadow-sm", className)}>
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {userMenuItems.map((item) => {
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

      {session?.user && (
        <div className="border-t border-border/50 p-4 z-10 bg-background/80 backdrop-blur-md shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors border border-transparent hover:border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-sm ring-2 ring-background">
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col truncate w-[130px]">
                    <span className="text-sm font-bold text-foreground leading-tight truncate">{session.user.name || "User"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider truncate">
                      Job Seeker
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[230px] ml-4 mb-2 bg-white dark:bg-slate-900 border-border shadow-2xl rounded-xl z-50">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1.5 p-1">
                  <p className="text-sm font-bold leading-none">{session.user.name}</p>
                  <p className="text-muted-foreground text-xs leading-none break-all">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer py-2 text-sm font-medium">
                <Link href="/profile" className="flex items-center text-foreground cursor-pointer w-full">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive font-bold focus:bg-destructive/10 flex cursor-pointer items-center py-2"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
