"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, BookOpen, Sparkles, ChevronDown, Settings, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks: { label: string, href: string }[] = [];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setShowMenu(false);
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // admin dashboard removed

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-4 group relative"
          >
            <div className="relative w-11 h-11 flex items-center justify-center overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[#38BDF8]/20" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#2563EB]/20" />
              <BookOpen className="w-5 h-5 text-slate-800 dark:text-slate-100 relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white transition-all duration-300">
                Minimalistic <span className="text-[#2563EB]">Learning.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden sm:block">
                Learn , Create , Grow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      >
                        <div className="absolute top-0 right-0 w-2 h-2 bg-[#38BDF8]/20 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#2563EB]/20 rounded-bl-xl" />
                      </motion.div>
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="hidden md:flex items-center">
              <div className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                <ThemeToggle />
              </div>
            </div>

            {/* User Menu / Login & Signup Duo */}
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all hover:border-[#2563EB]/30 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate text-[12px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{displayName}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute right-0 top-full mt-4 w-64 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 shadow-2xl space-y-1"
                    >
                      <div className="px-4 py-4 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                        <p className="text-[12px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        {user.email && (
                          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate uppercase tracking-[0.15em]">
                            {user.email}
                          </p>
                        )}
                      </div>
                      {/* Removed Settings Link */}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group"
                      >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center rounded-xl bg-[#2563EB] px-7 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 hover:scale-[1.02]"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Clinical */}
            <button
              className="md:hidden p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Clinical */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 w-[300px] bottom-0 z-50 bg-white dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800 shadow-2xl p-8 flex flex-col pt-28"
            >
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-6 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${isActive
                        ? "text-slate-900 bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-100 dark:border-slate-800"
                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-10 space-y-8">
                <div className="flex items-center justify-between px-6">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">System Theme</span>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <ThemeToggle />
                  </div>
                </div>

                {isAuthenticated && user ? (
                  <div className="space-y-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="px-5 py-4">
                      <p className="text-[12px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{displayName}</p>
                      {user.email && (
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate uppercase tracking-widest">{user.email}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      {/* Removed Settings Link */}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-red-400 transition-all hover:bg-white dark:hover:bg-slate-900 rounded-xl"
                      >
                        <LogOut className="w-5 h-5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 px-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 dark:border-slate-800 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="block px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-white text-center bg-[#2563EB] shadow-lg shadow-blue-500/20"
                    >
                      Join Platform
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav >
  );
};

export default Navbar;
