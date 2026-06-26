"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Settings2, Newspaper, BookOpen, Shield, Users, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { DatabaseStudio } from "./DatabaseStudio";

const SystemTab = dynamic(() => import('./tabs/SystemTab'), { loading: () => <TabLoader /> });
const PermissionsTab = dynamic(() => import('./tabs/PermissionsTab'), { loading: () => <TabLoader /> });
const UsersTab = dynamic(() => import('./tabs/UsersTab'), { loading: () => <TabLoader /> });
const HomepageTab = dynamic(() => import('./tabs/HomepageTab'), { loading: () => <TabLoader /> });
const SubscribersTab = dynamic(() => import('./tabs/SubscribersTab'), { loading: () => <TabLoader /> });
const TeamTab = dynamic(() => import('./tabs/TeamTab'), { loading: () => <TabLoader /> });

const TabLoader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-4 border-theme-accent/20" />
      <div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" />
    </div>
  </div>
);

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'permissions' | 'users' | 'homepage' | 'subscribers' | 'team' | 'database'>('system');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── PANEL HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center text-background shadow-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">System & DB Administration</h2>
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Admin Dashboard Engine</p>
          </div>
        </div>
        <Link
          href="/dashboard/blog-history"
          className="group flex items-center gap-2 px-5 py-2.5 bg-theme-element border border-theme-accent/20 text-foreground text-sm font-bold rounded-xl hover:bg-theme-element-sec hover:border-theme-accent/40 transition-all shadow-sm"
        >
          <Newspaper size={16} className="text-foreground/50 group-hover:text-theme-action transition-colors" />
          Access Content History
        </Link>
      </div>

      {/* ── TAB BAR NAVIGATION ──────────────────────────────────── */}
      <div className="flex flex-wrap border-b border-theme-accent/10 mb-8 gap-4 sm:gap-8 pb-3">
        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <Settings2 size={16} className={activeTab === 'system' ? 'text-theme-action' : 'text-foreground/45'} />
          System Settings & Queue
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'permissions' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <Shield size={16} className={activeTab === 'permissions' ? 'text-theme-action' : 'text-foreground/45'} />
          Route & RBAC Control
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <Users size={16} className={activeTab === 'users' ? 'text-theme-action' : 'text-foreground/45'} />
          User Accounts
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'homepage' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <BookOpen size={16} className={activeTab === 'homepage' ? 'text-theme-action' : 'text-foreground/45'} />
          Homepage Layout
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'subscribers' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <Mail size={16} className={activeTab === 'subscribers' ? 'text-theme-action' : 'text-foreground/45'} />
          Subscribers
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <UserIcon size={16} className={activeTab === 'team' ? 'text-theme-action' : 'text-foreground/45'} />
          Team Management
        </Button>

        <Button
          variant="none" size="none"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'database' ? 'text-theme-action border-b-2 border-theme-action scale-100' : 'text-foreground/50 hover:text-foreground scale-95'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={activeTab === 'database' ? 'text-theme-action' : 'text-foreground/45'}>
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          SQLite Studio
        </Button>
      </div>

      {/* ── TAB CONTENT RENDERING ──────────────────────────────── */}
      {activeTab === 'system' && <SystemTab />}
      {activeTab === 'permissions' && <PermissionsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'homepage' && <HomepageTab />}
      {activeTab === 'subscribers' && <SubscribersTab />}
      {activeTab === 'team' && <TeamTab />}
      {activeTab === 'database' && <DatabaseStudio />}
    </div>
  );
};

export default AdminPanel;
