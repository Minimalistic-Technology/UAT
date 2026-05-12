"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Menu, LogIn, PlusCircle, LogOut, User as UserIcon, AlignJustify, Newspaper, Flame, Heart, UserCheck, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  console.log("user: ", user);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { id: 'Home', label: 'Home', icon: BookOpen, href: '/' },
    { id: 'Blogs', label: 'Blogs', icon: BookOpen, href: '/blog' },
    { id: 'Resources', label: 'Resources', icon: BookOpen, href: '/resources' },
    { id: 'About', label: 'About', icon: UserCheck, href: '/about' },
    ...(isAuthenticated ? [
      { id: 'Dashboard', label: 'Dashboard', icon: BookOpen, href: '/dashboard' },
      { id: 'My Blogs', label: 'My Blogs', icon: Newspaper, href: '/my-blogs' }
    ] : [])
  ];

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isTransparent ? 'bg-transparent border-transparent' : 'bg-white/70 backdrop-blur-xl border-gray-100 shadow-sm'}`}>
      <div className="w-full px-[5%]">
        <div className="flex justify-between items-stretch h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group self-center z-10">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-md shadow-[#1877F2]  group-hover:scale-105 transition-transform duration-300">
              <BookOpen size={20} className="sm:size-[22px]" />
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

          {/* Navigation Links (Pill Design) */}
          <div className="hidden lg:flex flex-1 items-center justify-center h-full px-4">
            <div className="flex items-center gap-1">
              {/* Circular menu icon from the design */}
              {/* <button className="w-10 h-10 mr-4 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-colors">
                 <AlignJustify size={18} />
              </button> */}

              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`
                      relative px-2 py-1 mx-4 text-sm font-bold transition-colors whitespace-nowrap group
                      ${isActive
                        ? 'text-[#1877F2]'
                        : 'text-gray-600 hover:text-gray-900'
                      }
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
            {/* <button className="hidden sm:flex p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
              <Search size={20} />
            </button> */}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end mr-1">
                    <span className="text-sm font-bold text-gray-900  leading-tight">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[#1877F2]  border border-[#1877F2]/20 shadow-sm">
                    <UserIcon size={18} />
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-500  transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 text-gray-700  text-sm font-bold hover:text-[#1877F2] ] transition-all">
                  Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-6 py-2.5 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
                  Signup
                </Link>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100  rounded-xl transition-colors">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
