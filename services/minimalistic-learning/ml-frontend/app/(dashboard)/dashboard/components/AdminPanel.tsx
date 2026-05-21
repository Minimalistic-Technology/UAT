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
    className={`relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? colorClass : 'bg-theme-element-sec border border-theme-accent/20'
      }`}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={`pointer-events-none absolute left-0.5 inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center ${checked ? 'translate-x-[30px]' : 'translate-x-0'
        }`}
    >
      {loading ? <Loader2 size={12} className="animate-spin text-theme-action" /> : null}
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
        <div className="absolute inset-0 rounded-full border-4 border-theme-accent/20" />
        <div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-bold text-foreground/50 uppercase tracking-widest">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── SECTION HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center text-background shadow-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">System Configuration</h2>
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Global Platform Settings</p>
          </div>
        </div>
        <Link
          href="/dashboard/blog-history"
          className="group flex items-center gap-2 px-5 py-2.5 bg-theme-element border border-theme-accent/20 text-foreground text-sm font-bold rounded-xl hover:bg-theme-element-sec hover:border-theme-accent/40 transition-all shadow-sm active:scale-95"
        >
          <Newspaper size={16} className="text-foreground/50 group-hover:text-theme-action transition-colors" />
          Access Content History
        </Link>
      </div>

      {/* ── SETTINGS GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Auto Approve Card */}
        <div className="relative group bg-theme-element border border-theme-accent/20 rounded-[2rem] p-8 shadow-sm hover:shadow-lg hover:border-theme-accent/50 transition-all duration-300 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 dark:opacity-20 -mr-10 -mt-10 transition-all duration-500 ${autoApprove ? 'bg-green-500' : 'bg-orange-500'}`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${autoApprove ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                {autoApprove ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              </div>
              <ModernSwitch checked={autoApprove!} onChange={handleToggle} loading={isToggling} colorClass="bg-green-500" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Publishing Mode</h3>
            <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-6 flex-1">
              {autoApprove
                ? "Automatic Publishing: Posts submitted by users instantly go live without requiring manual review."
                : "Manual Moderation: All new submissions are placed in a queue awaiting admin approval."}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${autoApprove ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${autoApprove ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
              {autoApprove ? "Status: Live" : "Status: Moderated"}
            </div>
          </div>
        </div>

        {/* Resource Hub Card */}
        <div className="relative group bg-theme-element border border-theme-accent/20 rounded-[2rem] p-8 shadow-sm hover:shadow-lg hover:border-theme-accent/50 transition-all duration-300 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 dark:opacity-20 -mr-10 -mt-10 transition-all duration-500 ${resourceHub ? 'bg-theme-action' : 'bg-foreground/50'}`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${resourceHub ? 'bg-theme-action/10 text-theme-action' : 'bg-theme-element-sec text-foreground/50'}`}>
                <BookOpen size={24} />
              </div>
              <ModernSwitch checked={resourceHub!} onChange={handleToggleHub} loading={isTogglingHub} colorClass="bg-theme-action" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Resource Hub Visibility</h3>
            <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-6 flex-1">
              {resourceHub
                ? "The Resource Hub is currently visible and accessible to all visitors in the main navigation."
                : "The Resource Hub is hidden globally. Useful when updating content or undergoing maintenance."}
            </p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${resourceHub ? 'bg-theme-action/10 text-theme-action' : 'bg-theme-element-sec text-foreground/50'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${resourceHub ? 'bg-theme-action animate-pulse' : 'bg-foreground/50'}`} />
              {resourceHub ? "Public" : "Hidden"}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODERATION QUEUE ──────────────────────────────────────── */}
      <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-8 border-b border-theme-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-theme-element-sec/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Clock size={16} />
              </div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Content Moderation Queue</h3>
            </div>
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest ml-11">Review & Publish</p>
          </div>
          {pendingPosts.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{pendingPosts.length} Pending</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {pendingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-500/20">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h4 className="text-xl font-black text-foreground mb-2">Inbox Zero</h4>
              <p className="text-foreground/70 text-sm font-medium max-w-sm">There are no posts awaiting your review. Enjoy the peace of mind knowing everything is caught up!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingPosts.map((post: any) => (
                <div key={post._id} className="group relative bg-theme-element-sec border border-theme-accent/10 rounded-2xl p-5 hover:border-theme-action/50 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-theme-element flex items-center justify-center text-foreground/50 shrink-0 border border-theme-accent/20 group-hover:bg-theme-action/10 group-hover:text-theme-action group-hover:border-theme-action/30 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-lg font-black text-foreground truncate block hover:text-theme-action transition-colors leading-tight mb-1.5 pr-4">
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs font-bold text-foreground/50 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><UserIcon size={12} /> {post.authorId?.firstName} {post.authorId?.lastName}</span>
                          <span className="w-1 h-1 rounded-full bg-foreground/20" />
                          <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 md:ml-auto shrink-0 pt-3 md:pt-0 border-t border-theme-accent/10 md:border-none">
                      <button
                        onClick={() => handleApprove(post._id)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground hover:bg-theme-action text-background text-xs font-black rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                      >
                        {actionLoading === post._id + '-approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(post._id)}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-element hover:bg-red-500/10 text-foreground/70 hover:text-red-500 text-xs font-black rounded-xl border border-theme-accent/20 hover:border-red-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group/btn"
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
