"use client";

import React from "react";
import {
  Newspaper,
  Clock,
  BookOpen,
  BarChart3,
  Star,
  Settings,
} from "lucide-react";
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
    {
      title: "Write a Blog",
      href: "/blog/create",
      icon: Star,
      desc: "Share your knowledge with the world.",
    },
    {
      title: "Browse Resources",
      href: "/resources",
      icon: BookOpen,
      desc: "Explore curated learning materials.",
    },
    {
      title: "Update Profile",
      href: "/dashboard/settings",
      icon: Settings,
      desc: "Manage your personal information.",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="mb-1 h-9 w-20 animate-pulse rounded bg-gray-100" />
              ) : (
                <h3 className="text-3xl font-black text-gray-900">
                  {stat.value}
                </h3>
              )}
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-6 text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickLinks.map((link, index) => (
            <Link
              href={link.href}
              key={index}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#1877F2]/30 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors group-hover:bg-[#1877F2]/10 group-hover:text-[#1877F2]">
                <link.icon size={20} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#1877F2]">
                {link.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {link.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStats;
