"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GlobalRole } from "@/types";
import { Menu, User, LogOut, Briefcase, FileText, Building2 } from "lucide-react";
import { useState } from "react";

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

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const isEmployer = isAuthenticated && session?.user?.role === GlobalRole.USER && session?.user?.isEmployee;
  const isJobSeeker = isAuthenticated && session?.user?.role === GlobalRole.USER && !session?.user?.isEmployee;
  const showFindJobs = isLoading || !isEmployer;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b absolute top-0 z-50 h-16 w-full">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {showFindJobs && <NavLink href="/find-jobs">Find Jobs</NavLink>}

            {isLoading ? (
              /* Skeleton state to prevent layout jump */
              <div className="flex items-center gap-3 ml-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            ) : isAuthenticated ? (
              <>
                {isJobSeeker && <NavLink href="/applications">My Applications</NavLink>}
                {isEmployer && (
                  <>
                    <NavLink href="/employer-dashboard/jobs/create">Post Job</NavLink>
                    <NavLink href="/company-profile">Company</NavLink>
                  </>
                )}

                <div className="h-6 w-px bg-border mx-4" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 focus-visible:ring-0">
                      <User className="h-5 w-5 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer flex items-center">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest State */
              <div className="flex items-center gap-2 ml-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="text-primary">Login</Link>
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
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="text-left border-b pb-4">
                  <SheetTitle><Logo /></SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-1 mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      {showFindJobs && (
                        <MobileNavLink href="/find-jobs" onClick={() => setOpen(false)}>
                          <Briefcase className="h-4 w-4" /> Find Jobs
                        </MobileNavLink>
                      )}
                      
                      {isAuthenticated ? (
                        <>
                          {isJobSeeker && (
                            <MobileNavLink href="/applications" onClick={() => setOpen(false)}>
                              <FileText className="h-4 w-4" /> My Applications
                            </MobileNavLink>
                          )}
                          {isEmployer && (
                            <>
                              <MobileNavLink href="/post-job" onClick={() => setOpen(false)}>
                                <Briefcase className="h-4 w-4" /> Post Job
                              </MobileNavLink>
                              <MobileNavLink href="/company-profile" onClick={() => setOpen(false)}>
                                <Building2 className="h-4 w-4" /> Company
                              </MobileNavLink>
                            </>
                          )}
                          <div className="my-2 border-t" />
                          <MobileNavLink href="/profile" onClick={() => setOpen(false)}>
                            <User className="h-4 w-4" /> Profile
                          </MobileNavLink>
                          <Button variant="destructive" onClick={handleLogout} className="justify-start mt-4">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 mt-4">
                          <Button asChild className="w-full">
                            <Link href="/register" onClick={() => setOpen(false)}>Create Account</Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
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

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  onClick: () => void 
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 text-md font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
  >
    {children}
  </Link>
);