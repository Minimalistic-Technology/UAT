"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GlobalRole } from "@/types";
import {
  Menu,
  User,
  LogOut,
  Briefcase,
  FileText,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { menuItems as adminMenuItems } from "@/features/admin/components/sidebar";

// Shadcn UI Components
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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const isEmployer =
    isAuthenticated &&
    session?.user?.role === GlobalRole.USER &&
    session?.user?.isEmployee;
  const isJobSeeker =
    isAuthenticated &&
    session?.user?.role === GlobalRole.USER &&
    !session?.user?.isEmployee;
  const showFindJobs = isLoading || !isEmployer;
  const isAdmin = session?.user?.role === GlobalRole.SUPER_ADMIN;

  return (
    <nav className="absolute top-0 z-50 h-16 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            {showFindJobs && <NavLink href="/find-jobs">Find Jobs</NavLink>}

            {isLoading ? (
              /* Skeleton state to prevent layout jump */
              <div className="ml-2 flex items-center gap-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            ) : isAuthenticated ? (
              <>
                {isJobSeeker && (
                  <NavLink href="/user-dashboard/applications">
                    My Applications
                  </NavLink>
                )}
                {isEmployer && (
                  <NavLink href="/employer-dashboard/company-profile">Company</NavLink>
                )}

                <div className="bg-border mx-4 h-6 w-px" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full bg-slate-100 focus-visible:ring-0"
                    >
                      <User className="h-5 w-5 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                      <Link
                        href="/profile"
                        className="flex cursor-pointer items-center"
                      >
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest State */
              <div className="ml-2 flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="text-primary">
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Button size={"sm"} asChild>
                  <Link href="/employer-register">Sign Up as Employer</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="border-b pb-4 text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      {showFindJobs && !isAdmin && (
                        <MobileNavLink
                          href="/find-jobs"
                          onClick={() => setOpen(false)}
                        >
                          <Briefcase className="size-4 text-black" />
                          <span className="font-semibold text-black">
                            Find Jobs
                          </span>
                        </MobileNavLink>
                      )}

                      {isAuthenticated ? (
                        <>
                          {isJobSeeker && (
                            <MobileNavLink
                              href="/applications"
                              onClick={() => setOpen(false)}
                            >
                              <FileText className="h-4 w-4" /> My Applications
                            </MobileNavLink>
                          )}
                          {isEmployer && (
                            <>
                              <MobileNavLink
                                href="/company-profile"
                                onClick={() => setOpen(false)}
                              >
                                <Building2 className="h-4 w-4" /> Company
                              </MobileNavLink>
                            </>
                          )}
                          {isAdmin &&
                            adminMenuItems.map(
                              ({ label, href, icon: Icon }) => (
                                <MobileNavLink
                                  key={href}
                                  href={href}
                                  onClick={() => setOpen(false)}
                                  className={
                                    pathname === href
                                      ? "bg-blue-500/80 text-white hover:bg-blue-500 hover:text-white"
                                      : ""
                                  }
                                >
                                  <Icon className="size-4" /> {label}
                                </MobileNavLink>
                              ),
                            )}
                          <div className="border-t" />
                          <MobileNavLink
                            href="/profile"
                            onClick={() => setOpen(false)}
                          >
                            <User className="h-4 w-4" /> Profile
                          </MobileNavLink>
                          <div
                            onClick={handleLogout}
                            className="mx-4 flex cursor-pointer items-center justify-start text-red-500 hover:bg-red-300"
                          >
                            <LogOut className="mr-2 size-4" /> Logout
                          </div>
                        </>
                      ) : (
                        <div className="mt-4 flex flex-col gap-2">
                          <Button asChild className="w-full">
                            <Link
                              href="/register"
                              onClick={() => setOpen(false)}
                            >
                              Create Account
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/login" onClick={() => setOpen(false)}>
                              Sign In
                            </Link>
                          </Button>
                        </div>
                      )}
                    </>
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

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-muted-foreground hover:text-primary rounded-md px-3 py-2 text-sm font-medium transition-colors"
  >
    {children}
  </Link>
);

const MobileNavLink = ({
  href,
  onClick,
  className,
  children,
}: {
  href: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "text-md text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-slate-50",
      className,
    )}
  >
    {children}
  </Link>
);
