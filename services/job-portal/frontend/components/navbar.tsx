"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { menuItems as adminMenuItems } from "@/features/admin/components/sidebar";
import { menuItems as employerMenuItems } from "@/features/employer/components/employer-sidebar";

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

  if (pathname.startsWith("/admin-dashboard")) {
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
                  <NavLink href="/find-jobs" active={pathname === "/find-jobs" || pathname === "/"}>Find Jobs</NavLink>
                )}

                {isJobSeeker && (
                  <NavLink href="/user-dashboard/applications" active={pathname.includes("/user-dashboard")}>
                    My Applications
                  </NavLink>
                )}

                {isEmployer && (
                  <NavLink href="/employer-dashboard/company-profile" active={pathname.includes("/employer-dashboard")}>
                    My Dashboard
                  </NavLink>
                )}

                {((showFindJobs && !isAdmin) || isJobSeeker || isEmployer) && (
                  <div className="bg-border h-6 w-px" />
                )}

                {canUseDarkMode && (
                  <div>
                    <ThemeToggle />
                  </div>
                )}

                <UserDropdown session={session} onLogout={handleLogout} />
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
              <SheetContent side="right" className="w-72">
                <SheetHeader className="border-b pb-4 text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 pt-2">
                  {isLoading ? (
                    <MobileSkeleton />
                  ) : isAuthenticated ? (
                    <MobileAuthNav
                      session={session}
                      isEmployer={isEmployer ?? false}
                      isJobSeeker={isJobSeeker}
                      isAdmin={isAdmin}
                      pathname={pathname}
                      showFindJobs={showFindJobs}
                      onLogout={handleLogout}
                      onClose={closeSheet}
                      canUseDarkMode={canUseDarkMode}
                    />
                  ) : (
                    <MobileGuestButtons onClose={closeSheet} />
                  )}
                </div>
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
  onLogout,
}: {
  session: any;
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
          <Link href="/profile" className="flex cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
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
      <Button variant="outline" asChild className="border-slate-200 text-[#2563eb] hover:text-[#1d4ed8] hover:bg-slate-50 font-semibold px-5 shadow-sm">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 shadow-sm">
        <Link href="/register">Sign Up</Link>
      </Button>
      <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 shadow-sm">
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

function MobileAuthNav({
  session,
  isEmployer,
  isJobSeeker,
  isAdmin,
  pathname,
  showFindJobs,
  onLogout,
  onClose,
  canUseDarkMode,
}: {
  session: any;
  isEmployer: boolean;
  isJobSeeker: boolean;
  isAdmin: boolean;
  pathname: string;
  showFindJobs: boolean;
  onLogout: () => void;
  onClose: () => void;
  canUseDarkMode?: boolean;
}) {
  const roleMenuItems: MenuItem[] = isAdmin
    ? adminMenuItems
    : isEmployer
      ? employerMenuItems
      : [];

  return (
    <>
      {showFindJobs && !isAdmin && (
        <MobileNavLink href="/find-jobs" onClick={onClose}>
          Find Jobs
        </MobileNavLink>
      )}

      {isJobSeeker && (
        <MobileNavLink href="/user-dashboard/applications" onClick={onClose}>
          My Applications
        </MobileNavLink>
      )}

      {/* Role-specific sidebar items */}
      {roleMenuItems.map(({ label, href, icon: Icon }) => (
        <MobileNavLink
          key={href}
          href={href}
          onClick={onClose}
          active={pathname === href || pathname.startsWith(href + "/")}
        >
          <Icon className="size-4" />
          {label}
        </MobileNavLink>
      ))}

      <div className="my-1 border-t" />

      {canUseDarkMode && (
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
          <ThemeToggle />
        </div>
      )}

      <MobileNavLink href="/profile" onClick={onClose}>
        <User className="h-4 w-4" />
        Profile
      </MobileNavLink>

      <button
        onClick={onLogout}
        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut className="size-4" />
        Logout
      </button>
    </>
  );
}

function MobileGuestButtons({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 px-4">
      <MobileNavLink href="/find-jobs" onClick={onClose} className="justify-center border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200">
        Find Jobs
      </MobileNavLink>
      <Button variant="outline" asChild className="w-full border-slate-200 text-[#2563eb] hover:text-[#1d4ed8] hover:bg-slate-50 font-semibold shadow-sm">
        <Link href="/login" onClick={onClose}>
          Login
        </Link>
      </Button>
      <Button asChild className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow-sm">
        <Link href="/register" onClick={onClose}>
          Sign Up
        </Link>
      </Button>
      <Button asChild className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow-sm">
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
          ? "border-[#0b5cff] text-[#0b5cff] dark:border-blue-500 dark:text-blue-500"
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
          ? "bg-slate-100 text-slate-900"
          : "text-muted-foreground hover:text-primary hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
