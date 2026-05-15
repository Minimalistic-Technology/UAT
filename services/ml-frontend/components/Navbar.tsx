"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, LogOut, User as UserIcon, Newspaper, UserCheck, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'Home', label: 'Home', icon: BookOpen, href: '/' },
    { id: 'Blogs', label: 'Blogs', icon: BookOpen, href: '/blog' },
    { id: 'Resources', label: 'Resources', icon: BookOpen, href: '/resources' },
    { id: 'About', label: 'About', icon: UserCheck, href: '/about' },
    ...(isAuthenticated ? (
      user?.role === 'admin'
        ? [{ id: 'Dashboard', label: 'Dashboard', icon: BookOpen, href: '/dashboard' }]
        : [{ id: 'My Blogs', label: 'My Blogs', icon: Newspaper, href: '/my-blogs' }]
    ) : [])
  ];

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isTransparent ? 'bg-transparent border-transparent' : 'bg-white/70 backdrop-blur-xl border-gray-100 shadow-sm'}`}>
      <div className="w-full px-[5%]">
        <div className="flex justify-between items-stretch h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group self-center z-10">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md">
              <Image src="/logoML.png" alt="ML Logo" width={40} height={40} className="w-full h-full object-cover" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight leading-none">
                Minimalistic<span className="text-[#1877F2]">Learning</span>
              </span>
              <span className="text-[7px] sm:text-[8.5px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1 ml-0.5">
                Learn, Create, Grow
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex flex-1 items-center justify-center h-full px-4">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`
                      relative px-2 py-1 mx-4 text-sm font-bold transition-colors whitespace-nowrap group
                      ${isActive ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    {tab.label}
                    <span
                      className={`
                        absolute left-0 -bottom-1 h-[2px] rounded-full transition-all duration-300
                        ${isActive ? 'w-full bg-[#1877F2]' : 'w-0 bg-gray-900 group-hover:w-full'}
                      `}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 self-center z-10">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {/* User name */}
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>

                {/* User Avatar with Dropdown — only for regular users */}
                {user?.role !== 'admin' ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 w-9 h-9 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all shadow-sm focus:outline-none"
                      title="Account menu"
                    >
                      <UserIcon size={18} className="mx-auto" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* Profile Info */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-black text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          href="/my-blogs"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"
                        >
                          <Newspaper size={16} />
                          My Blogs
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"
                        >
                          <UserCheck size={16} />
                          Dashboard
                        </Link>

                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>

                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={() => { setIsDropdownOpen(false); logout(); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Admin: just show logout button directly */
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 text-gray-700 text-sm font-bold hover:text-[#1877F2] transition-all">
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-6 py-2.5 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
                  Signup
                </Link>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
