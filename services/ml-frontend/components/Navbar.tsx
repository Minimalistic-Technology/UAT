"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Search, Menu, LogIn, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70  backdrop-blur-xl border-b border-gray-100  transition-all duration-300">
      <div className="w-full px-[5%]">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-md shadow-[#1877F2]  group-hover:scale-105 transition-transform duration-300">
              <BookOpen size={20} className="sm:size-[22px]" />
            </div>
            <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600  tracking-tight">
              Minimalistic<span className="text-[#1877F2] ">Learning</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-sm font-bold text-gray-500  hover:text-[#1877F2]  transition-colors">
              Home
            </Link>
            {/* <Link href="/blog" className="text-sm font-bold text-gray-500  hover:text-emerald-600 transition-colors">
              Explore
            </Link> */}
            {isAuthenticated && (
              <Link href="/my-blogs" className="text-sm font-bold text-gray-500  hover:text-[#1877F2]  transition-colors">
                My Blogs
              </Link>
            )}
            {/* <Link href="/about" className="text-sm font-bold text-gray-500hover:text-emerald-600  transition-colors">
              About
            </Link> */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* <button className="hidden sm:flex p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
              <Search size={20} />
            </button> */}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end mr-1">
                    <span className="text-xs font-bold text-gray-900  leading-tight">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] text-[#1877F2] font-medium">
                      Authenticated
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
