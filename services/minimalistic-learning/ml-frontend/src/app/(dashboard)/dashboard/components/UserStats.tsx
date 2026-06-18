"use client";

import React from "react";
import { Newspaper, Clock, BookOpen, BarChart3, Star, Settings } from "lucide-react";
import Link from "next/link";
import { useGetUserStats } from "@/features/blog/hooks/use-get-user-stats";

const UserStats = () => {
  const { data: stats, isLoading } = useGetUserStats();

  const formatReadTime = (mins: number) => {
    if (!mins) return "0m";
    if (mins < 60) return `${mins}m`;
    const hrs = mins / 60;
    return Number.isInteger(hrs) ? `${hrs}h` : `${hrs.toFixed(1)}h`;
  };

  const formatViews = (views: number) => {
    if (!views) return "0";
    if (views >= 1000) {
      const k = views / 1000;
      return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return views.toString();
  };

  const statCards = [
    {
      title: "My Blogs",
      value: isLoading ? null : (stats?.blogsCount ?? 0).toString(),
      icon: Newspaper,
      color: "bg-blue-50 text-[#1877F2]",
    },
    {
      title: "Reading Time",
      value: isLoading ? null : formatReadTime(stats?.totalReadTime ?? 0),
      icon: Clock,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Saved Resources",
      value: isLoading ? null : (stats?.savedCount ?? 0).toString(),
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Views",
      value: isLoading ? null : formatViews(stats?.totalViews ?? 0),
      icon: BarChart3,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const quickLinks = [
    { title: "Write a Blog", href: "/blog/create", icon: Star, desc: "Share your knowledge with the world." },
    { title: "Browse Resources", href: "/resources", icon: BookOpen, desc: "Explore curated learning materials." },
    { title: "Update Profile", href: "/dashboard/settings", icon: Settings, desc: "Manage your personal information." },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="h-9 w-20 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              )}
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
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
    </div>
  );
};

export default UserStats;
