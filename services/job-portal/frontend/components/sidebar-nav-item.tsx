import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  forceExpanded?: boolean;
}

import { useSidebar } from "@/components/ui/sidebar-context";

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  forceExpanded,
}: SidebarNavItemProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  return (
    <Link
      href={href}
      title={effectiveCollapsed ? label : undefined}
      className={cn(
        "group flex items-center overflow-hidden px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "rounded-r-xl border-l-4 border-l-[#2563eb] bg-[#2563eb]/10 font-bold text-[#2563eb]"
          : "rounded-r-xl border-l-4 border-l-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white",
        effectiveCollapsed
          ? "mx-2 justify-center rounded-l-xl px-0"
          : "justify-between",
      )}
    >
      <div
        className={cn("flex items-center gap-3", effectiveCollapsed && "gap-0")}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            isActive
              ? "text-[#2563eb]"
              : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white",
          )}
        />
        {!effectiveCollapsed && (
          <span className="whitespace-nowrap">{label}</span>
        )}
      </div>
    </Link>
  );
}
