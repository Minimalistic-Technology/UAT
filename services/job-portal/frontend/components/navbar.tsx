"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, User, LogOut, Building2, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Sidebar } from "@/features/admin/components/sidebar";
import EmployerSidebar from "@/features/employer/components/employer-sidebar";
import UserSidebar from "@/features/user/components/user-sidebar";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./logo";
import { useNavSession } from "@/hooks/use-nav-session";
import { useGetUserDetails } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {
    session,
    isLoading,
    isAuthenticated,
    isEmployer,
    isJobSeeker,
    isAdmin,
  } = useNavSession();

  const { data: userProfileData } = useGetUserDetails(isAuthenticated);
  const allowedFeatures = userProfileData?.data?.allowedFeatures || [];
  const canUseDarkMode = allowedFeatures.includes("dark-mode");

  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const closeSheet = () => setOpen(false);
  const showFindJobs = isLoading || !isEmployer;

  const isPublicFindJobs = pathname?.startsWith("/find-jobs") || pathname?.startsWith("/job/") || pathname?.startsWith("/internship/");
  const isProfilePage = pathname?.startsWith("/profile");
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/employer-register";

  if (pathname !== "/" && !isPublicFindJobs && !isProfilePage && !isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed top-0 z-50 h-[72px] w-full border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0A0F1C] transition-colors duration-300">
      <div className="h-full px-4 sm:px-6 xl:px-12">
        <div className="flex h-full items-center justify-between">
          <Logo />

          {/* ── Left Empty Space (since center links are removed) ── */}
          <div className="hidden lg:flex flex-1" />

          {/* ── Desktop Right Actions ── */}
          <div className="hidden h-full items-center lg:flex gap-4">
            {isLoading ? (
              <DesktopSkeleton />
            ) : isAuthenticated ? (
              <div className="flex items-center h-full gap-8">
                {showFindJobs && !isAdmin && (
                  <NavLink href="/find-jobs" active={pathname === "/"}>Find Jobs</NavLink>
                )}

                {isJobSeeker && (
                  <NavLink href="/user-dashboard/applications" active={pathname.includes("/user-dashboard")}>
                    My Applications
                  </NavLink>
                )}

                {((showFindJobs && !isAdmin) || isJobSeeker) && (
                  <div className="bg-border h-6 w-px" />
                )}

                {canUseDarkMode && (
                  <div>
                    <ThemeToggle />
                  </div>
                )}

                <UserDropdown session={session} onLogout={handleLogout} isEmployer={isEmployer} isAdmin={isAdmin} isJobSeeker={isJobSeeker} />
              </div>
            ) : (
              <GuestButtons />
            )}
          </div>

          {/* ── Mobile Menu Trigger ── */}
          <div className="lg:hidden flex items-center justify-end h-full">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent shrink-0">
                  <Menu className="w-6 h-6 text-slate-800 dark:text-slate-200" strokeWidth={2.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 sm:w-72 bg-white dark:bg-[#0A0F1C] border-r dark:border-slate-800">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>

                {isLoading ? (
                  <div className="p-4 pt-10"><MobileSkeleton /></div>
                ) : isAuthenticated ? (
                  <>
                    {isAdmin && <Sidebar className="h-full w-full min-h-screen" forceExpanded />}
                    {isEmployer && <EmployerSidebar className="h-full w-full min-h-screen" forceExpanded />}
                    {isJobSeeker && <UserSidebar className="h-full w-full min-h-screen" forceExpanded />}
                  </>
                ) : (
                  <div className="flex flex-col gap-1 p-4 pt-10">
                    <MobileGuestButtons onClose={closeSheet} />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Desktop Sub-components ───────────────────────────────────────────────────

function UserDropdown({
  session,
  isEmployer,
  isAdmin,
  isJobSeeker,
  onLogout,
}: {
  session: any;
  isEmployer?: boolean;
  isAdmin?: boolean;
  isJobSeeker?: boolean;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 cursor-pointer rounded-full bg-slate-100 dark:bg-slate-800 focus-visible:ring-0"
        >
          <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 dark:border-slate-800">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session?.user?.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex cursor-pointer items-center font-medium">
            <User className="mr-2 h-4 w-4" /> My Profile
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard" className="flex cursor-pointer items-center text-foreground font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {isEmployer && (
          <DropdownMenuItem asChild>
            <Link href="/employer-dashboard" className="flex cursor-pointer items-center text-foreground font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {isJobSeeker && (
          <DropdownMenuItem asChild>
            <Link href="/user-dashboard" className="flex cursor-pointer items-center text-foreground font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {isEmployer && (
          <DropdownMenuItem asChild>
            <Link href="/employer-dashboard/company-profile" className="flex cursor-pointer items-center text-primary font-medium">
              <Building2 className="mr-2 h-4 w-4" /> My Company
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GuestButtons() {
  return (
    <div className="flex h-full items-center gap-3">
      <Link href="/find-jobs" className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors mr-3">
        Find Jobs
      </Link>
      <Button variant="outline" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
      <Button asChild>
        <Link href="/employer-register">Sign Up as Employer</Link>
      </Button>
    </div>
  );
}

function DesktopSkeleton() {
  return (
    <div className="ml-2 flex items-center gap-3">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
}

// ─── Mobile Sub-components ────────────────────────────────────────────────────



function MobileGuestButtons({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 px-4">
      <MobileNavLink href="/find-jobs" onClick={onClose} className="justify-center border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200">
        Find Jobs
      </MobileNavLink>
      <Button variant="outline" asChild className="w-full">
        <Link href="/login" onClick={onClose}>
          Login
        </Link>
      </Button>
      <Button asChild className="w-full">
        <Link href="/register" onClick={onClose}>
          Sign Up
        </Link>
      </Button>
      <Button asChild className="w-full">
        <Link href="/employer-register" onClick={onClose}>
          Sign Up as Employer
        </Link>
      </Button>
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="space-y-2 pt-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// ─── Shared Primitives ────────────────────────────────────────────────────────

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-full items-center text-sm font-bold transition-all border-b-[3px]",
        active
          ? "border-[#2563eb] text-[#2563eb] dark:border-[#3b82f6] dark:text-[#3b82f6]"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  active,
  className,
  children,
}: {
  href: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-slate-100 dark:bg-slate-800 text-[#2563eb] dark:text-[#3b82f6] font-bold"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
