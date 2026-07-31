"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Newspaper,
  UserCheck,
  Settings,
  Home,
  Info,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import NotificationDropdown from "./NotificationDropdown";
import { api } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";
import { useQuery } from "@tanstack/react-query";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ✅ FIX: React Query — 10 min cache, nahi dobara fetch hogi har page navigation pe
  const { data: settingsData } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => api.get("/public/settings").then((res) => res.data?.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });
  const resourceHubEnabled = settingsData?.resourceHubEnabled ?? false;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const tabs = [
    { id: "Home", label: "Home", href: "/" },
    { id: "Blogs", label: "Blogs", href: "/blog" },
    ...(resourceHubEnabled
      ? [{ id: "Resources", label: "Resources", href: "/resources" }]
      : []),
    { id: "About", label: "About Us", href: "/about" },
    ...(isAuthenticated
      ? user?.role?.toLowerCase() === "admin"
        ? [{ id: "Dashboard", label: "Admin Dashboard", href: "/dashboard" }]
        : [{ id: "My Blogs", label: "My Blogs", href: "/my-blogs" }]
      : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-[100] w-full transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-theme-element/85 border-theme-accent/20 border-b py-0 shadow-sm backdrop-blur-xl"
            : "bg-theme-element border-b border-transparent py-0"
        }`}
      >
        <div className="w-full px-6 sm:px-8 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-3">
                <div className="border-theme-accent/20 group- flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border bg-white shadow-sm transition-transform duration-300">
                  <Image
                    src="/logoML.png"
                    alt="ML Logo"
                    width={30}
                    height={30}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-lg leading-none font-extrabold tracking-tight">
                    Minimalistic
                    <span className="text-theme-action">Learning</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Navigation */}
            <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
              <ul className="flex items-center gap-1">
                {tabs.map((tab) => {
                  const isActive =
                    pathname === tab.href ||
                    (tab.href !== "/" && pathname.startsWith(tab.href));
                  return (
                    <li key={tab.id}>
                      <Link
                        href={tab.href}
                        className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                          isActive
                            ? "text-theme-action bg-theme-action/10"
                            : "text-foreground/70 hover:text-foreground hover:bg-theme-element-sec"
                        }`}
                      >
                        {tab.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {/* Notification Dropdown is ALWAYS visible */}
                  <div className="text-foreground/60 hover:text-foreground transition-colors">
                    <NotificationDropdown />
                  </div>

                  {/* Desktop Profile Dropdown - HIDDEN on Mobile/Tablet */}
                  <div className="relative hidden lg:block" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="border-theme-accent/20 hover:bg-theme-element-sec flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all focus:outline-none"
                    >
                      <div className="bg-theme-action flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm">
                        {user?.firstName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-foreground/50 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="bg-theme-element border-theme-accent/20 animate-in fade-in slide-in-from-top-4 absolute right-0 z-50 mt-3 w-64 rounded-xl border py-2 shadow-lg duration-200">
                        <div className="border-theme-accent/10 mb-2 border-b px-4 py-3">
                          <p className="text-foreground truncate text-sm font-bold">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-foreground/60 truncate text-xs">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                        >
                          <Home size={16} className="text-foreground/50" />{" "}
                          Dashboard
                        </Link>
                        {user?.role?.toLowerCase() === "admin" ? (
                          <Link
                            href="/dashboard/blog-history"
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Newspaper
                              size={16}
                              className="text-foreground/50"
                            />{" "}
                            Blog History
                          </Link>
                        ) : (
                          <Link
                            href="/my-blogs"
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Newspaper
                              size={16}
                              className="text-foreground/50"
                            />{" "}
                            Manage My Blogs
                          </Link>
                        )}
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                        >
                          <Settings size={16} className="text-foreground/50" />{" "}
                          Account Settings
                        </Link>

                        <div className="bg-theme-accent/10 my-2 h-px"></div>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link
                    href="/login"
                    className="text-foreground/70 hover:text-foreground px-5 py-2 text-sm font-semibold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-theme-action rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                  >
                    Signup
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:bg-theme-element-sec rounded-lg p-2 transition-colors focus:outline-none lg:hidden"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (Right to Left) */}
      <div
        className={`bg-foreground/20 fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`bg-theme-element border-theme-accent/20 absolute top-0 right-0 bottom-0 flex w-[280px] transform flex-col overflow-y-auto border-l shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar Header with Close Button */}
          <div className="border-theme-accent/10 flex items-center justify-between border-b px-6 py-5">
            <span className="text-theme-action text-lg font-bold">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:bg-theme-element-sec text-foreground/70 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Links */}
          <div className="flex flex-col gap-1 px-4 py-4">
            <div className="mb-3 pl-4">
              <ThemeToggle />
            </div>
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-theme-action/10 text-theme-action"
                      : "text-foreground hover:bg-theme-element-sec"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Profile Section or Login/Signup */}
          <div className="border-theme-accent/10 bg-theme-element-sec/30 mt-auto border-t px-4 py-6">
            {isAuthenticated ? (
              <div className="flex flex-col">
                <div className="mb-4 px-4">
                  <p className="text-foreground truncate text-base font-bold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-foreground/60 truncate text-sm">
                    {user?.email}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                >
                  <Home size={18} className="text-foreground/50" /> Dashboard
                </Link>
                {user?.role?.toLowerCase() === "admin" ? (
                  <Link
                    href="/dashboard/blog-history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                  >
                    <Newspaper size={18} className="text-foreground/50" /> Blog
                    History
                  </Link>
                ) : (
                  <Link
                    href="/my-blogs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                  >
                    <Newspaper size={18} className="text-foreground/50" />{" "}
                    Manage My Blogs
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:bg-theme-element-sec flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                >
                  <Settings size={18} className="text-foreground/50" /> Settings
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground border-theme-accent/20 hover:bg-theme-element-sec w-full rounded-xl border py-3.5 text-center font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-theme-action w-full rounded-xl py-3.5 text-center font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
