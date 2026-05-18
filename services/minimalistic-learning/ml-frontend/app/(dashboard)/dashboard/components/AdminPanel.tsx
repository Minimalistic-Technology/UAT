"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, Loader2, Newspaper, BookOpen, Settings2, ShieldCheck, Clock, FileText, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

/* ─── Modern Switch Component ─────────────────────────────────────────── */
const ModernSwitch = ({ checked, onChange, loading, colorClass }: { checked: boolean; onChange: () => void; loading: boolean; colorClass: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={loading}
    className={`relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? colorClass : 'bg-gray-200'
      }`}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={`pointer-events-none absolute left-0.5 inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center ${checked ? 'translate-x-[30px]' : 'translate-x-0'
        }`}
    >
      {loading ? <Loader2 size={12} className="animate-spin text-gray-400" /> : null}
    </span>
  </button>
);

const AdminPanel = () => {
  const [autoApprove, setAutoApprove] = useState<boolean | null>(null);
  const [resourceHub, setResourceHub] = useState<boolean | null>(null);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isTogglingHub, setIsTogglingHub] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, pendingRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/posts/pending'),
      ]);
      setAutoApprove(settingsRes.data.data.autoApprovePost);
      setResourceHub(settingsRes.data.data.resourceHubEnabled ?? true);
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

  const handleToggleHub = async () => {
    if (resourceHub === null) return;
    setIsTogglingHub(true);
    try {
      const res = await api.patch('/admin/settings', { resourceHubEnabled: !resourceHub });
      setResourceHub(res.data.data.resourceHubEnabled ?? !resourceHub);
      toast.success(`Resource Hub ${!resourceHub ? 'enabled' : 'disabled'} for users`);
    } catch {
      toast.error('Failed to update Resource Hub setting');
    } finally {
      setIsTogglingHub(false);
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
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-[#1877F2] border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── SECTION HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Configuration</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Platform Settings</p>
          </div>
        </div>
        <Link
          href="/dashboard/blog-history"
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm active:scale-95"
        >
          <Newspaper size={16} className="text-gray-400 group-hover:text-[#1877F2] transition-colors" />
          Access Content History
        </Link>
      </div>

      {/* ── SETTINGS GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Auto Approve Card */}
        <div className="relative group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-all duration-500 ${autoApprove ? 'bg-green-500' : 'bg-orange-500'}`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${autoApprove ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {autoApprove ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              </div>
              <ModernSwitch checked={autoApprove!} onChange={handleToggle} loading={isToggling} colorClass="bg-green-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Publishing Mode</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6 flex-1">
              {autoApprove
                ? "Automatic Publishing: Posts submitted by users instantly go live without requiring manual review."
                : "Manual Moderation: All new submissions are placed in a queue awaiting admin approval."}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${autoApprove ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${autoApprove ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
              {autoApprove ? "Status: Live" : "Status: Moderated"}
            </div>
          </div>
        </div>

        {/* Resource Hub Card */}
        <div className="relative group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-all duration-500 ${resourceHub ? 'bg-[#1877F2]' : 'bg-gray-400'}`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${resourceHub ? 'bg-blue-50 text-[#1877F2]' : 'bg-gray-50 text-gray-400'}`}>
                <BookOpen size={24} />
              </div>
              <ModernSwitch checked={resourceHub!} onChange={handleToggleHub} loading={isTogglingHub} colorClass="bg-[#1877F2]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Resource Hub Visibility</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6 flex-1">
              {resourceHub
                ? "The Resource Hub is currently visible and accessible to all visitors in the main navigation."
                : "The Resource Hub is hidden globally. Useful when updating content or undergoing maintenance."}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${resourceHub ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${resourceHub ? 'bg-[#1877F2] animate-pulse' : 'bg-gray-400'}`} />
              {resourceHub ? "Public" : "Hidden"}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODERATION QUEUE ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Clock size={16} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Content Moderation Queue</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-11">Review & Publish</p>
          </div>
          {pendingPosts.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-black text-orange-700 uppercase tracking-widest">{pendingPosts.length} Pending</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {pendingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Inbox Zero</h4>
              <p className="text-gray-500 text-sm font-medium max-w-sm">There are no posts awaiting your review. Enjoy the peace of mind knowing everything is caught up!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingPosts.map((post: any) => (
                <div key={post._id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#1877F2]/30 hover:shadow-[0_4px_20px_rgba(24,119,242,0.05)] transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100 group-hover:bg-blue-50 group-hover:text-[#1877F2] group-hover:border-blue-100 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-lg font-black text-gray-900 truncate block hover:text-[#1877F2] transition-colors leading-tight mb-1.5 pr-4">
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><UserIcon size={12} /> {post.authorId?.firstName} {post.authorId?.lastName}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 md:ml-auto shrink-0 pt-3 md:pt-0 border-t border-gray-50 md:border-none">
                      <button
                        onClick={() => handleApprove(post._id)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-[#1877F2] text-white text-xs font-black rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                      >
                        {actionLoading === post._id + '-approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(post._id)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-black rounded-xl border border-gray-200 hover:border-red-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                      >
                        {actionLoading === post._id + '-reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                        Reject
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
