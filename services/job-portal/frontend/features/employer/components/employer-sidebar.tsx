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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/employer-dashboard" },
  { label: "Post a Job", icon: PlusCircle, href: "/employer-dashboard/jobs/create" },
  { label: "Manage Jobs", icon: Briefcase, href: "/employer-dashboard/jobs/manage" },
  { label: "Manage Team", icon: Users, href: "/employer-dashboard/team" },
  { label: "Company Settings", icon: Building2, href: "/employer-dashboard/settings" },
  { label: "Account Settings", icon: Settings, href: "/employer-dashboard/account" },
]

export default function EmployerSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

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
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                  {item.label}
                </div>
                {/* {item.badge && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    {item.badge}
                  </span>
                )} */}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t p-4 bg-white">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}