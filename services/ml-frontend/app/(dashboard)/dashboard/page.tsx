"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { BookOpen, Settings, Newspaper, User as UserIcon, BarChart3, Clock, Star, ShieldAlert, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Admin Panel Component ────────────────────────────────────────────────────
const AdminPanel = () => {
  const [autoApprove, setAutoApprove] = useState<boolean | null>(null);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, pendingRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/posts/pending'),
      ]);
      setAutoApprove(settingsRes.data.data.autoApprovePost);
      setPendingPosts(pendingRes.data.data.items || []);
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async () => {
    if (autoApprove === null) return;
    setIsToggling(true);
    try {
      const res = await api.patch('/admin/settings', { autoApprovePost: !autoApprove });
      setAutoApprove(res.data.data.autoApprovePost);
      toast.success(`Auto-approve ${!autoApprove ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setIsToggling(false);
    }
  };

  const handleApprove = async (postId: string) => {
    setActionLoading(postId + '-approve');
    try {
      await api.patch(`/admin/posts/${postId}/approve`);
      toast.success('Post approved and published!');
      setPendingPosts(prev => prev.filter(p => p._id !== postId));
    } catch {
      toast.error('Failed to approve post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: string) => {
    setActionLoading(postId + '-reject');
    try {
      await api.patch(`/admin/posts/${postId}/reject`);
      toast.success('Post rejected');
      setPendingPosts(prev => prev.filter(p => p._id !== postId));
    } catch {
      toast.error('Failed to reject post');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-red-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 mt-12">
      {/* Admin Badge */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
          <ShieldAlert size={18} />
        </div>
        <h2 className="text-xl font-black text-gray-900">Admin Control Panel</h2>
      </div>

      {/* Auto-Approve Toggle Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Post Auto-Approval</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              {autoApprove
                ? "Posts go live immediately after user submission."
                : "Posts require manual admin approval before going live."}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              autoApprove
                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
            }`}
          >
            {isToggling ? (
              <Loader2 size={20} className="animate-spin" />
            ) : autoApprove ? (
              <ToggleRight size={24} />
            ) : (
              <ToggleLeft size={24} />
            )}
            {autoApprove ? "Auto-Approve: ON" : "Manual Approve: ON"}
          </button>
        </div>
      </div>

      {/* Pending Posts */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Pending Review
            {pendingPosts.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-black rounded-full">
                {pendingPosts.length}
              </span>
            )}
          </h3>
        </div>

        {pendingPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
              <CheckCircle size={28} />
            </div>
            <p className="text-gray-500 text-sm font-medium">No pending posts. All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post: any) => (
              <div key={post._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    By {post.authorId?.firstName} {post.authorId?.lastName} · {post.authorId?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(post._id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl transition-all disabled:opacity-60"
                  >
                    {actionLoading === post._id + '-approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(post._id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black rounded-xl border border-red-200 transition-all disabled:opacity-60"
                  >
                    {actionLoading === post._id + '-reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
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

  const isAdmin = user?.role === 'admin';

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
      {/* Header */}
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

      {/* Stats Grid — only for regular users */}
      {!isAdmin && (
        <>
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
        </>
      )}

      {/* Admin Panel — only for admins */}
      {isAdmin && <AdminPanel />}
    </div>
  );
};

export default DashboardPage;
