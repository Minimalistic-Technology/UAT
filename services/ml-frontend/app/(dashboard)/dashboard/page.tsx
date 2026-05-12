"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { BookOpen, Settings, Newspaper, User as UserIcon, BarChart3, Clock, Star } from "lucide-react";
import Link from "next/link";

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: "My Blogs", value: "12", icon: Newspaper, color: "bg-blue-50 text-[#1877F2]" },
    { title: "Reading Time", value: "4.5h", icon: Clock, color: "bg-green-50 text-green-600" },
    { title: "Saved Resources", value: "28", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
    { title: "Total Views", value: "1.2k", icon: BarChart3, color: "bg-orange-50 text-orange-600" },
  ];

  const quickLinks = [
    { title: "Write a Blog", href: "/blog/create", icon: Star, desc: "Share your knowledge with the world." },
    { title: "Browse Resources", href: "/resources", icon: BookOpen, desc: "Explore curated learning materials." },
    { title: "Update Profile", href: "/dashboard/settings", icon: Settings, desc: "Manage your personal information." },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-[5%] py-24 sm:py-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#1877F2]">{user?.firstName}</span>!
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] shadow-sm">
            <UserIcon size={24} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links / Actions */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <Link href={link.href} key={index} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1877F2]/30 transition-all">
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#1877F2]/10 flex items-center justify-center text-gray-600 group-hover:text-[#1877F2] transition-colors mb-4">
                <link.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1877F2] transition-colors">{link.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent Activity placeholder */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
         <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
         <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Clock size={28} />
            </div>
            <p className="text-gray-500 text-sm">No recent activity to show.</p>
            <p className="text-xs text-gray-400 mt-1">When you publish a blog or save resources, they will appear here.</p>
         </div>
      </div>
    </div>
  );
};

export default DashboardPage;
