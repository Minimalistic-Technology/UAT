"use client";

import React from "react";
import { ShieldAlert, User as UserIcon, Activity, Star } from "lucide-react";

interface Props {
  user: any;
  isAdmin: boolean;
}

const DashboardHeader = ({ user, isAdmin }: Props) => {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 sm:p-12 mb-12">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/5 blur-3xl rounded-full pointer-events-none" />
      {isAdmin && (
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-72 h-72 bg-gradient-to-tr from-red-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                <ShieldAlert size={12} />
                <span>Admin Privileges</span>
              </div>
            )}
            {!isAdmin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-[#1877F2] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                <Star size={12} />
                <span>Member</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-tight mb-2">
            Welcome back,<br />
            <span className={`bg-clip-text text-transparent ${isAdmin ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-[#1877F2] to-blue-400'}`}>
              {user?.firstName} {user?.lastName}
            </span>
          </h1>
          <p className="text-gray-500 font-medium max-w-md leading-relaxed mt-4">
            {isAdmin 
              ? "Oversee the platform, manage content submissions, and configure global settings from your central command center." 
              : "Track your reading progress, manage your saved resources, and publish your own stories."}
          </p>
        </div>

        <div className="flex items-center gap-5 bg-gray-50/80 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Current Session</span>
            <span className="text-sm font-bold text-gray-900">{user?.email}</span>
          </div>
          <div className="relative">
            <div className={`absolute inset-0 blur-md rounded-full ${isAdmin ? 'bg-red-500/30' : 'bg-[#1877F2]/30'}`} />
            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-md border ${isAdmin ? 'border-red-100 text-red-600' : 'border-blue-100 text-[#1877F2]'}`}>
              {isAdmin ? <ShieldAlert size={24} /> : <UserIcon size={24} />}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
