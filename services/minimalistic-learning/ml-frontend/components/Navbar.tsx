"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, LogOut, User as UserIcon, Newspaper, UserCheck, Settings, Home, Info } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import NotificationDropdown from './NotificationDropdown';
import { api } from '@/lib/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resourceHubEnabled, setResourceHubEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/public/settings')
      .then(res => {
        setResourceHubEnabled(res.data?.data?.resourceHubEnabled ?? true);
      })
      .catch(() => {
        // Fail silently
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    { id: 'Home', label: 'Home', icon: Home, href: '/' },
    { id: 'Blogs', label: 'Blogs', icon: Newspaper, href: '/blog' },
    ...(resourceHubEnabled ? [{ id: 'Resources', label: 'Resources', icon: BookOpen, href: '/resources' }] : []),
    { id: 'About', label: 'About', icon: Info, href: '/about' },
    ...(isAuthenticated ? (
      user?.role?.toLowerCase() === 'admin'
        ? [
            { id: 'Dashboard', label: 'Dashboard', icon: Settings, href: '/dashboard' },
            { id: 'Blog History', label: 'Blog History', icon: Newspaper, href: '/dashboard/blog-history' }
          ]
        : [{ id: 'My Blogs', label: 'My Blogs', icon: Newspaper, href: '/my-blogs' }]
    ) : [])
  ];

  return (
    <>
      <nav 
        className={`fixed left-4 right-4 md:left-[5%] md:right-[5%] max-w-[1400px] mx-auto z-[100] transition-all duration-500 ease-out
          ${isScrolled 
            ? 'top-4 bg-gray-950/85 backdrop-blur-xl border border-gray-800/60 rounded-[2rem] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.3)]' 
            : 'top-6 bg-gray-950/95 backdrop-blur-2xl border border-gray-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] rounded-[2rem]'
          }`}
        style={{
          transform: isScrolled ? 'translateY(0) scale(0.98)' : 'translateY(0) scale(1)',
        }}
      >
        <div className="w-full px-5 sm:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-[110]">
              <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md border border-gray-800">
                <Image src="/logoML.png" alt="ML Logo" width={40} height={40} className="w-full h-full object-cover" priority />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-xl font-black tracking-tight leading-none text-white transition-colors`}>
                  Minimalistic<span className="text-[#1877F2]">Learning</span>
                </span>
                <span className="text-[7px] sm:text-[8.5px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 ml-0.5">
                  Learn, Create, Grow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1.5 bg-gray-900/50 p-1.5 rounded-full border border-gray-800/50">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full overflow-hidden group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-[#1877F2] rounded-full -z-10 shadow-[0_0_15px_rgba(24,119,242,0.4)]" />
                    )}
                    {/* Hover subtle glow effect */}
                    {!isActive && (
                      <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300 -z-10" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <tab.icon size={14} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#1877F2] transition-colors'} />
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-5 relative z-[110]">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  
                  {/* Notification Dropdown wrapper to blend with dark navbar */}
                  <div className="text-gray-300 hover:text-white transition-colors">
                     <NotificationDropdown />
                  </div>

                  <div className="hidden sm:flex flex-col items-end pl-4 border-l border-gray-800">
                    <span className="text-sm font-bold text-white">{user?.firstName}</span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-10 h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:shadow-[0_0_15px_rgba(24,119,242,0.5)] transition-all duration-300"
                    >
                      <UserIcon size={18} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-56 bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 py-2 z-[120] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <p className="text-sm font-black text-white">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {user?.role?.toLowerCase() === 'admin' ? (
                          <Link href="/dashboard/blog-history" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors">
                            <Newspaper size={16} /> Blog History
                          </Link>
                        ) : (
                          <Link href="/my-blogs" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors">
                            <Newspaper size={16} /> My Blogs
                          </Link>
                        )}
                        <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"><UserCheck size={16} />Dashboard</Link>
                        <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"><Settings size={16} />Settings</Link>
                        <button onClick={() => { setIsDropdownOpen(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-gray-800 mt-1"><LogOut size={16} />Logout</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/login" className="px-5 py-2 text-gray-300 text-sm font-bold hover:text-white transition-colors">Login</Link>
                  <Link href="/register" className="px-6 py-2.5 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95">
                    Signup
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 text-white hover:bg-gray-800 rounded-xl transition-colors border border-gray-800"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[150] lg:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Menu Content */}
        <div className={`absolute top-0 right-0 h-full w-[300px] bg-gray-950 border-l border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            <div className="flex flex-col gap-3 mt-4">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all border border-transparent ${isActive ? 'bg-[#1877F2] text-white shadow-[0_0_15px_rgba(24,119,242,0.3)]' : 'text-gray-300 hover:bg-gray-900 hover:border-gray-800 hover:text-white'}`}
                  >
                    <tab.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-gray-800">
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center text-white font-bold border border-gray-800 hover:bg-gray-900 rounded-2xl active:scale-95 transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 text-center bg-[#1877F2] text-white font-bold rounded-2xl shadow-[0_0_15px_rgba(24,119,242,0.4)] active:scale-95 transition-all"
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full py-4 flex items-center justify-center gap-3 text-red-400 font-bold bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-2xl transition-all"
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
