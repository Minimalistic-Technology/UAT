"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  User as UserIcon,
  Sparkles,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { SidebarNavItem } from "@/components/sidebar-nav-item";
import Logo from "@/components/logo";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import { useSidebar } from "@/components/ui/sidebar-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/employer-dashboard" },
  {
    label: "Post a Job / Internship",
    icon: PlusCircle,
    href: "/employer-dashboard/listings/create",
  },
  { label: "Saved Drafts", icon: FileEdit, href: "/employer-dashboard/drafts" },
  {
    label: "Manage Jobs",
    icon: Briefcase,
    href: "/employer-dashboard/jobs/manage",
  },
  {
    label: "Manage Internships",
    icon: Briefcase,
    href: "/employer-dashboard/internships/manage",
  },
  {
    label: "All Applications",
    icon: FileText,
    href: "/employer-dashboard/applications",
  },
  { label: "Manage Team", icon: Users, href: "/employer-dashboard/team" },
  { label: "Settings", icon: Settings2, href: "/employer-dashboard/settings" },
];

export default function EmployerSidebar({
  className,
  forceExpanded,
}: {
  className?: string;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { data: session } = useSession();

  const userDetails = session?.user;
  const companyRole = userDetails?.companyRole;

  const { data: responseData } = useGetMyCompanyDetails();
  const planName = responseData?.data?.currentPlan?.name || "Free Tier";

  const { isCollapsed, toggleCollapse } = useSidebar();
  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  const roleBasedItems =
    companyRole === "owner"
      ? menuItems
      : menuItems.filter((item) => item.label !== "Manage Team");

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
          {roleBasedItems.map((item) => {
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
        {effectiveCollapsed ? (
          <div className="mt-auto px-2">
            <Link
              href="/employer-dashboard/plans"
              className="flex aspect-square w-full items-center justify-center rounded-xl bg-[#2563eb] text-white transition hover:bg-blue-700"
            >
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="mt-auto px-4 py-4">
            <div className="relative space-y-3 overflow-hidden rounded-xl bg-[#2563eb] p-4 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)]">
              <div className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold tracking-widest text-blue-100 uppercase drop-shadow-sm">
                  {planName}
                </span>
                <span className="font-heading text-lg leading-tight font-bold">
                  Upgrade to Pro
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="relative z-10 h-9 w-full cursor-pointer rounded-lg bg-white px-0 font-bold text-[#2563eb] shadow-sm hover:bg-slate-50"
              >
                <Link href="/employer-dashboard/plans">Get Access</Link>
              </Button>
            </div>
          </div>
        )}
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
                      : "E"}
                  </div>
                  {!effectiveCollapsed && (
                    <div className="flex w-[130px] flex-col truncate">
                      <span className="text-foreground truncate text-sm leading-tight font-bold">
                        {session.user.name || "Employer"}
                      </span>
                      <span className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                        {companyRole === "owner" ? "Owner / Admin" : "Member"}
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
                  href="/employer-dashboard/profile"
                  className="text-foreground flex w-full cursor-pointer items-center"
                >
                  <UserIcon className="text-muted-foreground mr-2 h-4 w-4" /> My
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer py-2 text-sm font-medium"
              >
                <Link
                  href="/employer-dashboard/company-profile"
                  className="text-primary flex w-full cursor-pointer items-center"
                >
                  <Building2 className="text-primary mr-2 h-4 w-4" /> My Company
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
