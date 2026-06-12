import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
}

import { useSidebar } from "@/components/ui/sidebar-context";

export function SidebarNavItem({ href, label, icon: Icon, isActive }: SidebarNavItemProps) {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 overflow-hidden",
        isActive
          ? "bg-[#2563eb]/10 text-[#2563eb] border-l-4 border-l-[#2563eb] rounded-r-xl font-bold"
          : "text-slate-500 dark:text-slate-400 border-l-4 border-l-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-r-xl",
        isCollapsed ? "justify-center rounded-l-xl mx-2 px-0" : "justify-between"
      )}
    >
      <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
        <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#2563eb]" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")} />
        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
      </div>
    </Link>
  )
}
