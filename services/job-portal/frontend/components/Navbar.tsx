"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/Button";
import { UserRole } from "@/types";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./logo";

const NAV_CONFIG = {
  [UserRole.JOB_SEEKER]: [{ label: "My Applications", href: "/applications" }],
  [UserRole.EMPLOYER]: [
    { label: "Post Job", href: "/post-job" },
    { label: "Company", href: "/company-profile" },
  ],
};

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="bg-white shadow-md fixed z-50 inset-0 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!session ||
            (session && session.user.role === UserRole.JOB_SEEKER) ? (
              <NavLink href="/jobs">Find Jobs</NavLink>
            ) : null}

            {session ? (
              <>
                {session.user.role === UserRole.JOB_SEEKER && (
                  <NavLink href="/applications">My Applications</NavLink>
                )}

                {session.user.role === UserRole.EMPLOYER && (
                  <>
                    <NavLink href="/post-job">Post Job</NavLink>
                    <NavLink href="/company-profile">Company</NavLink>
                  </>
                )}

                <NavLink href="/profile">Profile</NavLink>

                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink href="/jobs">Find Jobs</NavLink>
            {session ? (
              <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/profile">Profile</NavLink>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
    >
      {children}
    </Link>
  );
};
