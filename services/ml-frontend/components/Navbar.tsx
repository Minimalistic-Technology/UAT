"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, LogOut, User as UserIcon, Newspaper, UserCheck, Settings, Home, Info } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const tabs = [
    { id: 'Home', label: 'Home', icon: Home, href: '/' },
    { id: 'Blogs', label: 'Blogs', icon: Newspaper, href: '/blog' },
    { id: 'Resources', label: 'Resources', icon: BookOpen, href: '/resources' },
    { id: 'About', label: 'About', icon: Info, href: '/about' },
    ...(isAuthenticated ? (
      user?.role?.toLowerCase() === 'admin'
        ? [{ id: 'Dashboard', label: 'Dashboard', icon: Settings, href: '/dashboard' }]
        : [{ id: 'My Blogs', label: 'My Blogs', icon: Newspaper, href: '/my-blogs' }]
    ) : [])
  ];

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${isTransparent ? 'bg-transparent border-transparent' : 'bg-white/80 backdrop-blur-xl border-gray-100 shadow-sm'}`}>
        <div className="w-full px-[5%]">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group relative z-[110]">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Image src="/logoML.png" alt="ML Logo" width={40} height={40} className="w-full h-full object-cover" priority />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-xl font-black tracking-tight leading-none text-gray-900`}>
                  Minimalistic<span className="text-[#1877F2]">Learning</span>
                </span>
                <span className="text-[7px] sm:text-[8.5px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1 ml-0.5">
                  Learn, Create, Grow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`relative px-4 py-2 text-sm font-bold transition-colors group ${isActive ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab.label}
                    <span className={`absolute left-4 right-4 -bottom-1 h-[2px] rounded-full transition-all duration-300 ${isActive ? 'bg-[#1877F2]' : 'bg-gray-400 opacity-0 group-hover:opacity-100'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-4 relative z-[110]">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{user?.firstName}</span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2]/20 transition-all shadow-sm"
                    >
                      <UserIcon size={20} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[120] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-black text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link href="/my-blogs" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"><Newspaper size={16} />My Blogs</Link>
                        <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"><UserCheck size={16} />Dashboard</Link>
                        <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-[#1877F2] transition-colors"><Settings size={16} />Settings</Link>
                        <button onClick={() => { setIsDropdownOpen(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"><LogOut size={16} />Logout</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="px-5 py-2.5 text-gray-700 text-sm font-bold hover:text-[#1877F2] transition-all">Login</Link>
                  <Link href="/register" className="px-6 py-2.5 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all">Signup</Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[150] lg:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Menu Content */}
        <div className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            <div className="flex flex-col gap-2 mt-4">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-[#1877F2]/10 text-[#1877F2]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <tab.icon size={22} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center text-gray-700 font-bold border border-gray-200 rounded-2xl active:scale-95 transition-transform"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center bg-[#1877F2] text-white font-bold rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full py-4 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 rounded-2xl"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
