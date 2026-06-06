import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
}

export function SidebarNavItem({ href, label, icon: Icon, isActive }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
        {label}
      </div>
    </Link>
  )
}
