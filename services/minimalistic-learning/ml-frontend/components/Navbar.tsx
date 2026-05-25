"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, LogOut, User as UserIcon, Newspaper, UserCheck, Settings, Home, Info, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import NotificationDropdown from './NotificationDropdown';
import { api } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resourceHubEnabled, setResourceHubEnabled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/public/settings')
      .then(res => {
        setResourceHubEnabled(res.data?.data?.resourceHubEnabled ?? false);
      })
      .catch(() => {
        // Fallback to false so it doesn't show unless explicitly on
        setResourceHubEnabled(false);
      });
  }, []);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const tabs = [
    { id: 'Home', label: 'Home', href: '/' },
    { id: 'Blogs', label: 'Blogs', href: '/blog' },
    ...(resourceHubEnabled ? [{ id: 'Resources', label: 'Resources', href: '/resources' }] : []),
    { id: 'About', label: 'About Us', href: '/about' },
    ...(isAuthenticated ? (
      user?.role?.toLowerCase() === 'admin'
        ? [
          { id: 'Dashboard', label: 'Admin Dashboard', href: '/dashboard' },
        ]
        : [{ id: 'My Blogs', label: 'My Blogs', href: '/my-blogs' }]
    ) : [])
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-500 ease-out ${isScrolled
          ? 'bg-theme-element/85 backdrop-blur-xl shadow-sm border-b border-theme-accent/20 py-0'
          : 'bg-theme-element border-b border-transparent py-0'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">

            {/* Left side: Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-theme-accent/20 flex items-center justify-center bg-white transition-transform duration-300 group-hover:scale-105">
                  <Image src="/logoML.png" alt="ML Logo" width={30} height={30} className="object-contain" priority />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-foreground leading-none">
                    Minimalistic<span className="text-theme-action">Learning</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <ul className="flex items-center gap-1">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                  return (
                    <li key={tab.id}>
                      <Link
                        href={tab.href}
                        className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive
                          ? 'text-theme-action bg-theme-action/10'
                          : 'text-foreground/70 hover:text-foreground hover:bg-theme-element-sec'
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
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-5">
                  <div className="text-foreground/60 hover:text-foreground transition-colors">
                    <NotificationDropdown />
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-theme-accent/20 hover:bg-theme-element-sec transition-all focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-theme-action text-white flex items-center justify-center shadow-sm font-bold text-sm">
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <ChevronDown size={16} className={`text-foreground/50 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-theme-element rounded-xl shadow-lg border border-theme-accent/20 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="px-4 py-3 border-b border-theme-accent/10 mb-2">
                          <p className="text-sm font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
                        </div>

                        <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-theme-element-sec transition-colors">
                          <Home size={16} className="text-foreground/50" /> Dashboard
                        </Link>
                        {user?.role?.toLowerCase() === 'admin' ? (
                          <Link href="/dashboard/blog-history" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-theme-element-sec transition-colors">
                            <Newspaper size={16} className="text-foreground/50" /> Blog History
                          </Link>
                        ) : (
                          <Link href="/my-blogs" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-theme-element-sec transition-colors">
                            <Newspaper size={16} className="text-foreground/50" /> Manage My Blogs
                          </Link>
                        )}
                        <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-theme-element-sec transition-colors">
                          <Settings size={16} className="text-foreground/50" /> Account Settings
                        </Link>

                        <div className="h-px bg-theme-accent/10 my-2"></div>

                        <button onClick={() => { setIsDropdownOpen(false); logout(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <a href="/login" className="px-5 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
                    Login
                  </a>
                  <a href="/register" className="px-6 py-2.5 bg-theme-action text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
                    Signup
                  </a>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-foreground focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div
          className={`absolute inset-x-0 top-0 bg-theme-element shadow-2xl border-b border-theme-accent/20 transition-transform duration-300 ease-in-out transform pt-20 pb-6 px-4 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 pl-2">
            <ThemeToggle />
          </div>

          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold ${isActive
                    ? 'bg-theme-action/10 text-theme-action'
                    : 'text-foreground hover:bg-theme-element-sec'
                    }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-theme-accent/10 pl-2 pr-2">
              <a
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 text-center text-foreground font-semibold border border-theme-accent/20 rounded-xl hover:bg-theme-element-sec"
              >
                Login
              </a>
              <a
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 text-center bg-theme-action text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Signup
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
