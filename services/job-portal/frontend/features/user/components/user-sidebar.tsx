"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  User as UserIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNavItem } from "@/components/sidebar-nav-item";
import Logo from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar-context";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const userMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
  { label: "Find Jobs", icon: Search, href: "/user-dashboard/find-jobs" },
  {
    label: "My Applications",
    icon: Briefcase,
    href: "/user-dashboard/applications",
  },
];

export default function UserSidebar({
  className,
  forceExpanded,
}: {
  className?: string;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { data: session } = useSession();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  const userDetails = session?.user;

  return (
    <div
      className={cn(
        "bg-background/80 relative flex flex-col border-r shadow-sm backdrop-blur-xl transition-all duration-300",
        effectiveCollapsed ? "w-[80px]" : "w-64",
        className,
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "border-border bg-background absolute top-5 -right-4 z-50 hidden h-8 w-8 rounded-full shadow-md lg:flex",
          effectiveCollapsed && "rotate-180",
        )}
        onClick={toggleCollapse}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        className={cn(
          "border-border/50 flex h-16 items-center border-b px-6",
          effectiveCollapsed && "justify-center px-0",
        )}
      >
        {!effectiveCollapsed ? (
          <Logo />
        ) : (
          <span className="text-primary bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border text-2xl font-bold">
            J
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
        <nav className="space-y-1">
          {userMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                forceExpanded={forceExpanded}
              />
            );
          })}
        </nav>
      </div>

      {session?.user && (
        <div className="border-border/50 bg-background/80 z-10 shrink-0 border-t p-4 backdrop-blur-md">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hover:bg-muted/50 hover:border-primary/10 flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 transition-colors">
                <div
                  className={cn(
                    "flex items-center gap-3",
                    effectiveCollapsed && "w-full justify-center",
                  )}
                >
                  <div className="bg-primary/20 text-primary ring-background flex size-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  {!effectiveCollapsed && (
                    <div className="flex w-[130px] flex-col truncate">
                      <span className="text-foreground truncate text-sm leading-tight font-bold">
                        {session.user.name || "User"}
                      </span>
                      <span className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                        Job Seeker
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border z-50 mb-2 ml-4 w-[230px] rounded-xl bg-white shadow-2xl dark:bg-slate-900"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1.5 p-1">
                  <p className="text-sm leading-none font-bold">
                    {session.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none break-all">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="cursor-pointer py-2 text-sm font-medium"
              >
                <Link
                  href="/user-dashboard/profile"
                  className="text-foreground flex w-full cursor-pointer items-center"
                >
                  <UserIcon className="text-muted-foreground mr-2 h-4 w-4" /> My
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center py-2 font-bold"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
