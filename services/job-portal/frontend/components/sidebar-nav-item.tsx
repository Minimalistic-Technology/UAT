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
          ? "bg-primary/10 text-primary border-l-4 border-l-primary rounded-r-md"
          : "text-muted-foreground border-l-4 border-l-transparent hover:bg-muted hover:text-foreground rounded-r-md"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        {label}
      </div>
    </Link>
  )
}
