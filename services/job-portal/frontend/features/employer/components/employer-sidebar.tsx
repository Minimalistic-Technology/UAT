"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Building2,
  Settings,
  LogOut,
  PlusCircle,
  Settings2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { SidebarNavItem } from "@/components/sidebar-nav-item"

export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/employer-dashboard" },
  { label: "Post a Job / Internship", icon: PlusCircle, href: "/employer-dashboard/jobs/create" },
  { label: "Manage Jobs", icon: Briefcase, href: "/employer-dashboard/jobs/manage" },
  { label: "Manage Internships", icon: Briefcase, href: "/employer-dashboard/internships/manage" },
  { label: "Manage Team", icon: Users, href: "/employer-dashboard/team" },
  { label: "Settings", icon: Settings2, href: "/employer-dashboard/settings" },
  // { label: "Company Settings", icon: Building2, href: "/employer-dashboard/settings" },
  // { label: "Account Settings", icon: Settings, href: "/employer-dashboard/account" },
]

export default function EmployerSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { data: session, status } = useSession();

  const userDetails = session?.user;
  const companyRole = userDetails?.companyRole;

  const roleBasedItems = companyRole === "owner" ? menuItems : menuItems.filter(item => item.label !== "Manage Team");

  return (
    <div className={cn("min-h-[calc(100vh-4rem)] w-64 flex-col border-r bg-slate-50/50 hidden lg:flex", className)}>
      <div className="flex h-16 items-center px-6 border-b bg-white">
        <div className="size-10 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">EP</span>
        </div>
        <span className="ml-3 font-bold text-lg tracking-tight text-slate-900">Employer Panel</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {roleBasedItems.map((item) => {
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

      <div className="border-t p-4 bg-white">
        {/* 
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
        */}
      </div>
    </div>
  )
}