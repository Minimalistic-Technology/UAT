"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
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
  Search,
  ShieldCheck,
  Ticket,
  Notebook,
  BarChart3,
  ToggleLeft,
  TerminalSquare,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useNavSession } from "@/hooks/use-nav-session";

export const adminMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin-dashboard" },
  { label: "User Management", icon: Users, href: "/admin-dashboard/users" },
  {
    label: "KYC Applications",
    icon: ShieldCheck,
    href: "/admin-dashboard/kyc",
  },
  { label: "Coupons", icon: Ticket, href: "/admin-dashboard/coupons" },
  { label: "Plans", icon: Notebook, href: "/admin-dashboard/plans" },
  { label: "Analytics", icon: BarChart3, href: "/admin-dashboard/analytics" },
  {
    label: "Feature Flags",
    icon: ToggleLeft,
    href: "/admin-dashboard/features",
  },
  {
    label: "System Settings",
    icon: Settings,
    href: "/admin-dashboard/settings",
  },
  {
    label: "DB Console",
    icon: TerminalSquare,
    href: "/admin-dashboard/db-console",
  },
];

export const employerMenuItems = [
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
  { label: "Billing", icon: FileText, href: "/employer-dashboard/billing" },
];

export const userMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user-dashboard" },
  { label: "Find Jobs", icon: Search, href: "/user-dashboard/find-jobs" },
  {
    label: "My Applications",
    icon: Briefcase,
    href: "/user-dashboard/applications",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { session, isAdmin, isEmployer, isJobSeeker, isLoading } =
    useNavSession();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  const companyRole = session?.user?.companyRole;

  let menuItems = userMenuItems;
  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isEmployer) {
    menuItems =
      companyRole === "owner"
        ? employerMenuItems
        : employerMenuItems.filter((item) => item.label !== "Manage Team");
  } else if (isJobSeeker) {
    menuItems = userMenuItems;
  }

  const roleLabel = isAdmin
    ? "Super Admin"
    : isEmployer
      ? companyRole === "owner"
        ? "Owner / Admin"
        : "Member"
      : "Job Seeker";

  const initial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : isAdmin
      ? "A"
      : isEmployer
        ? "E"
        : "U";

  return (
    <Sidebar
      collapsible="icon"
      side={isMobile ? "right" : "left"}
      {...props}
      className="bg-background/80 z-40 border-r shadow-sm backdrop-blur-xl"
    >
      <SidebarHeader className="border-border/50 flex h-16 justify-center border-b px-4">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-header"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full items-center justify-between"
            >
              <Logo />
              <SidebarTrigger />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-header"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full items-center justify-center"
            >
              <SidebarTrigger />
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))
          ) : (
            <AnimatePresence>
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className="font-medium"
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (isMobile) {
                              setOpenMobile(false);
                            }
                          }}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </AnimatePresence>
          )}
        </SidebarMenu>

        {isEmployer && (
          <div className="mt-auto px-2">
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/employer-dashboard/plans"
                    className="flex aspect-square w-full items-center justify-center rounded-xl bg-[#2563eb] text-white transition hover:bg-blue-700"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative space-y-3 overflow-hidden rounded-xl bg-[#2563eb] p-4 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)]">
                    <div className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold tracking-widest text-blue-100 uppercase drop-shadow-sm">
                        Premium
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-border/50 border-t p-2">
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-primary/20 text-primary ring-background flex aspect-square size-8 items-center justify-center rounded-full font-bold ring-2">
                  {initial}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session.user.name || "User"}
                  </span>
                  <span className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                    {roleLabel}
                  </span>
                </div>
                <ChevronRight className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={4}
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="bg-primary/20 text-primary ring-background flex aspect-square size-8 items-center justify-center rounded-full font-bold ring-2">
                    {initial}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session.user.name || "User"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session.user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isEmployer && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/employer-dashboard/profile"
                      className="flex cursor-pointer items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/employer-dashboard/company-profile"
                      className="text-primary flex cursor-pointer items-center"
                    >
                      <Building2 className="text-primary mr-2 h-4 w-4" /> My
                      Company
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin-dashboard/profile"
                    className="flex cursor-pointer items-center"
                  >
                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
              )}
              {isJobSeeker && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/user-dashboard/profile"
                    className="flex cursor-pointer items-center"
                  >
                    <UserIcon className="mr-2 h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
