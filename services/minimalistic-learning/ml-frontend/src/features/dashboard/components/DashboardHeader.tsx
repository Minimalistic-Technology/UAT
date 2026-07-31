"use client";

import React from "react";
import { ShieldAlert, User as UserIcon, Activity, Star } from "lucide-react";

interface Props {
  user: any;
  isAdmin: boolean;
}

const DashboardHeader = ({ user, isAdmin }: Props) => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
      {/* Background Decor */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-linear-to-br from-[#1877F2]/10 to-[#1877F2]/5 blur-3xl" />
      {isAdmin && (
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full bg-linear-to-tr from-red-500/10 to-transparent blur-3xl" />
      )}

      <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-red-600 uppercase shadow-sm">
                <ShieldAlert size={12} />
                <span>Admin Privileges</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-[#1877F2] uppercase shadow-sm">
                <Star size={12} />
                <span>Member</span>
              </div>
            )}
          </div>
          <h1 className="mb-2 text-4xl leading-tight font-black tracking-tighter text-gray-900 sm:text-5xl">
            Welcome back,
            <br />
            <span
              className={`bg-clip-text text-transparent ${isAdmin ? "bg-linear-to-r from-red-600 to-red-400" : "bg-linear-to-r from-[#1877F2] to-blue-400"}`}
            >
              {user?.firstName} {user?.lastName}
            </span>
          </h1>
          <p className="mt-4 max-w-md leading-relaxed font-medium text-gray-500">
            {isAdmin
              ? "Oversee the platform, manage content submissions, and configure global settings from your central command center."
              : "Track your reading progress, manage your saved resources, and publish your own stories."}
          </p>
        </div>

        <div className="flex items-center gap-5 rounded-3xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="hidden flex-col items-end sm:flex">
            <span className="mb-1 text-xs font-black tracking-widest text-gray-400 uppercase">
              Current Session
            </span>
            <span className="text-sm font-bold text-gray-900">
              {user?.email}
            </span>
          </div>
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full blur-md ${isAdmin ? "bg-red-500/30" : "bg-[#1877F2]/30"}`}
            />
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-md ${isAdmin ? "border-red-100 text-red-600" : "border-blue-100 text-[#1877F2]"}`}
            >
              {isAdmin ? <ShieldAlert size={24} /> : <UserIcon size={24} />}
            </div>
            {/* Online indicator */}
            <div className="absolute right-0 bottom-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
