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
        "group flex items-center justify-between px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#2563eb]/10 text-[#2563eb] border-l-4 border-l-[#2563eb] rounded-r-xl font-bold"
          : "text-slate-500 dark:text-slate-400 border-l-4 border-l-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-r-xl"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        {label}
      </div>
    </Link>
  )
}
