"use client";

import React from "react";
import { ShieldAlert, User as UserIcon } from "lucide-react";

interface Props {
  user: any;
  isAdmin: boolean;
}

const DashboardHeader = ({ user, isAdmin }: Props) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className={isAdmin ? "text-red-600" : "text-[#1877F2]"}>{user?.firstName}</span>!
          </h1>
          {isAdmin && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full flex items-center gap-1">
              <ShieldAlert size={12} /> Admin
            </span>
          )}
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          {isAdmin ? "Manage your platform from the admin control panel." : "Here's what's happening with your account today."}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isAdmin ? "bg-red-100 text-red-600" : "bg-[#1877F2]/10 text-[#1877F2]"}`}>
          {isAdmin ? <ShieldAlert size={24} /> : <UserIcon size={24} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
