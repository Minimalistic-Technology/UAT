"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Service', path: '/services' },
    // { name: 'Template', path: '/templates' },
    { name: 'About Us', path: '/about' },
  ];

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const el = document.getElementById(path.substring(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={cn("fixed inset-x-0 top-6 z-1000 transition-all duration-500")}>
      <div className="mx-auto w-full max-w-7xl px-[1.5rem]">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-8 py-2",
            "border border-[hsla(0,0%,0%,0.1)] bg-[hsla(240,33%,97%,1)] backdrop-blur-[20px]",
            "dark:border-white/5 dark:bg-[hsla(0,0%,5%,0.6)]",
            "transition-all duration-500",
            scrolled && "bg-background/80 py-3 shadow-xl"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full bg-primary",
                "text-xs font-black text-black"
              )}
            >
              MT
            </div>
            <span className="hidden gap-2 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.2em] md:flex">
              Minimalistic{" "}
              <span className="bg-linear-to-tr from-primary to-primary/80 bg-clip-text text-transparent">Technology</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className={cn(
                    "group relative py-2 text-[9px] font-bold uppercase tracking-[0.2em] xl:text-[12px] transition-colors",
                    isActive ? "text-[var(--text-main)]" : "text-neutral-400 hover:text-[var(--text-main)]"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-[1px] bg-primary transition-all duration-500",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleThemeToggle}
              whileHover={{rotate: 10, scale: 1.1}}
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mounted ? theme : "unmounted"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {mounted ? (
                    theme === "light" ? (
                      <Sun size={20} className="text-primary" />
                    ) : (
                      <Moon size={20} className="text-primary" />
                    )
                  ) : (
                    <div style={{ width: 20, height: 20 }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative z-10 hidden items-center justify-center rounded-full sm:inline-flex",
                "bg-primary px-8 py-3 lg:px-12",
                "text-[11px] font-bold uppercase tracking-[0.1em] text-black",
                "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:-translate-y-[2px] hover:bg-[#9de02b] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)]"
              )}
              onClick={() => {
                if (pathname === "/") {
                  document
                    .getElementById("contact-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#contact-form");
                }
              }}
            >
              Get Started
            </motion.button>

            <button
              className="lg:hidden text-[var(--text-main)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "overflow-hidden border-0 border-b lg:hidden",
              "border-[hsla(0,0%,0%,0.05)] bg-[hsla(210,10%,97%,0.8)] backdrop-blur-[20px]",
              "dark:bg-[hsla(0,0%,5%,0.6)]"
            )}
          >
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-[clamp(1.5rem,5vw,4rem)] py-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link.path)}
                    className={cn(
                      "border-b py-4 text-lg font-black uppercase tracking-widest text-[var(--text-main)] transition-colors",
                      isActive ? "border-primary" : "border-[var(--border)]"
                    )}
                  >
                    {link.name}
                  </a>
                );
              })}
              <button
                className={cn(
                  "relative z-10 mt-4 inline-flex w-full items-center justify-center rounded-2xl",
                  "bg-primary px-8 py-4 lg:px-12 lg:py-5",
                  "font-bold text-black",
                  "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:-translate-y-[2px] hover:bg-[#9de02b] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)]"
                )}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname === "/") {
                    document
                      .getElementById("contact-form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#contact-form");
                  }
                }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
