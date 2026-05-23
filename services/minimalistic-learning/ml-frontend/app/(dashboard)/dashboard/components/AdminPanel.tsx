"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, Loader2, Newspaper, BookOpen, Settings2, ShieldCheck, Clock, FileText, User as UserIcon, Trash2, Plus, Users, Shield } from "lucide-react";
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

  // Tab and Advanced DB state
  const [activeTab, setActiveTab] = useState<'system' | 'permissions' | 'users'>('system');
  const [permissions, setPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isNewPermLoading, setIsNewPermLoading] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newDescription, setNewDescription] = useState('');

  // Permissions pagination & search inputs
  const [permPage, setPermPage] = useState(1);
  const [permSearch, setPermSearch] = useState('');

  // Sync pagination page to 1 whenever filtering/searching routes
  useEffect(() => {
    setPermPage(1);
  }, [permSearch]);

  const filteredPermissions = permissions.filter(perm => {
    const searchVal = permSearch.toLowerCase().trim();
    if (!searchVal) return true;
    return (
      perm.path.toLowerCase().includes(searchVal) ||
      perm.role.toLowerCase().includes(searchVal) ||
      (perm.description && perm.description.toLowerCase().includes(searchVal)) ||
      (perm.method && perm.method.toLowerCase().includes(searchVal))
    );
  });

  const itemsPerPage = 10;
  const totalPermPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const displayedPermissions = filteredPermissions.slice(
    (permPage - 1) * itemsPerPage,
    permPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, pendingRes, permRes, usersRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/posts/pending'),
        api.get('/admin/permissions'),
        api.get('/admin/users')
      ]);

      setAutoApprove(settingsRes.data.data.autoApprovePost);
      setResourceHub(settingsRes.data.data.resourceHubEnabled ?? true);
      setPendingPosts(pendingRes.data.data.items || []);
      setPermissions(permRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async () => {
    if (autoApprove === null) return;
    const previous = autoApprove;
    setAutoApprove(!previous); // Optimistic Instant Flip
    toast.success(`Auto-approve ${!previous ? 'enabled' : 'disabled'}`); // Instant UX Alert
    try {
      await api.patch('/admin/settings', { autoApprovePost: !previous });
    } catch {
      setAutoApprove(previous); // Revert
      toast.error('Failed to update settings');
    }
  };

  const handleToggleHub = async () => {
    if (resourceHub === null) return;
    const previous = resourceHub;
    setResourceHub(!previous); // Optimistic Instant Flip
    toast.success(`Resource Hub ${!previous ? 'enabled' : 'disabled'} for users`); // Instant UX Alert
    try {
      await api.patch('/admin/settings', { resourceHubEnabled: !previous });
    } catch {
      setResourceHub(previous); // Revert
      toast.error('Failed to update Resource Hub setting');
    }
  };

  const handleApprove = async (postId: string) => {
    // ⚡ Optimistic Updates: Hide immediately for faster UX
    const previousPending = pendingPosts;
    setPendingPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
    setActionLoading(postId + '-approve');
    toast.success('Post approved and published!'); // Instant UX Alert

    try {
      await api.patch(`/admin/posts/${postId}/approve`);
    } catch {
      // 🔄 Revert if API fails
      setPendingPosts(previousPending);
      toast.error('Failed to approve post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: string) => {
    // ⚡ Optimistic Update
    const previousPending = pendingPosts;
    setPendingPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
    setActionLoading(postId + '-reject');
    toast.success('Post rejected'); // Instant UX Alert

    try {
      await api.patch(`/admin/posts/${postId}/reject`);
    } catch {
      // 🔄 Revert
      setPendingPosts(previousPending);
      toast.error('Failed to reject post');
    } finally {
      setActionLoading(null);
    }
  };

  // Route Custom Check Actions
  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath) return toast.error('Rule access path is required');
    setIsNewPermLoading(true);
    try {
      const res = await api.post('/admin/permissions', {
        path: newPath,
        method: newMethod || null,
        role: newRole,
        isActive: true,
        description: newDescription || null
      });
      toast.success('Rule pattern registered in DB!');
      setPermissions(prev => [...prev, res.data.data].sort((a: any, b: any) => a.role.localeCompare(b.role) || a.path.localeCompare(b.path)));
      setNewPath('');
      setNewMethod('');
      setNewDescription('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add rule permission');
    } finally {
      setIsNewPermLoading(false);
    }
  };

  const handleTogglePermission = async (id: string, currentStatus: boolean) => {
    // ⚡ Optimistic UI Update: Flip instantly for zero-latency feel
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    toast.success('Permission status changed globally'); // Instant UX Alert

    try {
      await api.patch(`/admin/permissions/${id}/toggle`);
    } catch {
      // 🔄 Revert if API fails
      setPermissions(prev => prev.map(p => p.id === id ? { ...p, isActive: currentStatus } : p));
      toast.error('Failed to modify permission state');
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route permission pattern?')) return;

    // ⚡ Optimistic Update
    const previousPermissions = permissions;
    setPermissions(prev => prev.filter(p => p.id !== id));
    toast.success('Route access pattern removed from DB'); // Instant UX Alert

    try {
      await api.delete(`/admin/permissions/${id}`);
    } catch {
      // 🔄 Revert
      setPermissions(previousPermissions);
      toast.error('Failed to remove permissions path');
    }
  };

  // User Actions
  const handleRoleChange = async (userId: string, targetRole: string) => {
    // ⚡ Optimistic Update
    const previousUsers = users;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
    toast.success('User role changed successfully!'); // Instant UX Alert

    try {
      await api.put(`/admin/users/${userId}`, { role: targetRole });
    } catch {
      // 🔄 Revert
      setUsers(previousUsers);
      toast.error('Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('De-register this user? This removes all active profiles from DB.')) return;

    // ⚡ Optimistic Update
    const previousUsers = users;
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('User account removed');

    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (err: any) {
      // 🔄 Revert
      setUsers(previousUsers);
      toast.error(err.response?.data?.message || 'Access Denied: cannot execute accounts action');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-theme-accent/20" />
        <div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-bold text-foreground/50 uppercase tracking-widest w-full text-center">Loading Admin Database...</p>
    </div>
  );

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
          className="group flex items-center gap-2 px-5 py-2.5 bg-theme-element border border-theme-accent/20 text-foreground text-sm font-bold rounded-xl hover:bg-theme-element-sec hover:border-theme-accent/40 transition-all shadow-sm active:scale-95"
        >
          <Newspaper size={16} className="text-foreground/50 group-hover:text-theme-action transition-colors" />
          Access Content History
        </Link>
      </div>

      {/* ── TAB BAR NAVIGATION ──────────────────────────────────── */}
      <div className="flex flex-wrap border-b border-theme-accent/10 mb-8 gap-4 sm:gap-8 pb-3">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'system'
            ? 'text-theme-action border-b-2 border-theme-action scale-100'
            : 'text-foreground/50 hover:text-foreground scale-95'
            }`}
        >
          <Settings2 size={16} className={activeTab === 'system' ? 'text-theme-action' : 'text-foreground/45'} />
          System Settings & Queue
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'permissions'
            ? 'text-theme-action border-b-2 border-theme-action scale-100'
            : 'text-foreground/50 hover:text-foreground scale-95'
            }`}
        >
          <Shield size={16} className={activeTab === 'permissions' ? 'text-theme-action' : 'text-foreground/45'} />
          Route & RBAC Control
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'users'
            ? 'text-theme-action border-b-2 border-theme-action scale-100'
            : 'text-foreground/50 hover:text-foreground scale-95'
            }`}
        >
          <Users size={16} className={activeTab === 'users' ? 'text-theme-action' : 'text-foreground/45'} />
          User Accounts Control
        </button>
      </div>

      {/* ── TAB CONTENT: SYSTEM SETTINGS ─────────────────────────── */}
      {activeTab === 'system' && (
        <div className="space-y-12">
          {/* Settings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Approve */}
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

          {/* Moderation Queue */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm">
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
                  <p className="text-foreground/70 text-sm font-medium max-w-sm">No posts awaiting approval. Enjoy the clean state!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pendingPosts.map((post: any) => {
                    const postId = post.id || post._id;
                    return (
                      <div key={postId} className="group relative bg-theme-element-sec border border-theme-accent/10 rounded-2xl p-5 hover:border-theme-action/50 hover:shadow-md transition-all duration-300">
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
                              onClick={() => handleApprove(postId)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground hover:bg-theme-action text-background text-xs font-black rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                            >
                              {actionLoading === postId + '-approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(postId)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-element hover:bg-red-500/10 text-foreground/70 hover:text-red-500 text-xs font-black rounded-xl border border-theme-accent/20 hover:border-red-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                            >
                              {actionLoading === postId + '-reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: ROUTE & RBAC CONTROL ───────────────────── */}
      {activeTab === 'permissions' && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Add New Permission Rule Form */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
              <Plus size={20} className="text-theme-action" />
              Register Route Access Rule
            </h3>
            <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-6">Database Pattern Creation</p>

            <form onSubmit={handleAddPermission} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Route Path (Exact / Template)</label>
                <input
                  type="text"
                  placeholder="e.g. /api/v1/posts/:blogId"
                  value={newPath}
                  onChange={e => setNewPath(e.target.value)}
                  className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/30"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Rule Name / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Create Blog Post"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Method</label>
                <select
                  value={newMethod}
                  onChange={e => setNewMethod(e.target.value)}
                  className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold"
                >
                  <option value="">ALL Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Role Class</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isNewPermLoading}
                  className="w-full bg-theme-action hover:bg-theme-action/90 text-white font-black text-sm uppercase py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isNewPermLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add Rule
                </button>
              </div>
            </form>
          </div>

          {/* Permissions Rules List */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-theme-accent/10 bg-theme-element-sec/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Active Route Permission matrix</h3>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">PostgreSQL Real-Time Guard Rules</p>
              </div>
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search rules path or role..."
                  value={permSearch}
                  onChange={e => setPermSearch(e.target.value)}
                  className="w-full bg-theme-element border border-theme-accent/20 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/45 shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-accent/10 bg-theme-element-sec/20 text-xs font-black uppercase tracking-wider text-foreground/60">
                    <th className="py-4 px-6 w-24">Role</th>
                    <th className="py-4 px-6">Allowed Access Rule & Details</th>
                    <th className="py-4 px-6 text-center w-24">Status</th>
                    <th className="py-4 px-6 text-right w-20">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-accent/5">
                  {displayedPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-sm font-semibold text-foreground/50">
                        No custom route permission definitions matching filter.
                      </td>
                    </tr>
                  ) : (
                    displayedPermissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-theme-element-sec/20 transition-colors text-sm font-semibold text-foreground/80">
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${perm.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                            <Shield size={12} />
                            {perm.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5 text-left">
                            <span className="text-sm font-bold text-foreground">
                              {perm.description || 'Custom Dynamic Route Access'}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-foreground/50 select-all">{perm.path}</span>
                              <span className="bg-theme-element border border-theme-accent/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-theme-action whitespace-nowrap">
                                {perm.method || 'ANY'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center align-middle">
                          <div className="flex justify-center">
                            <ModernSwitch
                              checked={perm.isActive}
                              onChange={() => handleTogglePermission(perm.id, perm.isActive)}
                              loading={false}
                              colorClass="bg-green-500"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeletePermission(perm.id)}
                            className="p-2 text-foreground/45 hover:text-red-500 transition-colors"
                            title="Delete Permission Rule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPermPages > 1 && (
              <div className="p-6 border-t border-theme-accent/10 bg-theme-element-sec/20 flex items-center justify-between flex-wrap gap-4">
                <p className="text-xs font-bold text-foreground/45 uppercase tracking-widest">
                  Showing {(permPage - 1) * itemsPerPage + 1} - {Math.min(permPage * itemsPerPage, filteredPermissions.length)} of {filteredPermissions.length} rules
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={permPage === 1}
                    onClick={() => setPermPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 bg-theme-element border border-theme-accent/20 text-foreground text-xs font-black rounded-lg transition-all hover:bg-theme-element-sec disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-theme-element-sec border border-theme-accent/10 text-foreground text-xs font-black rounded-lg select-none">
                    Page {permPage} of {totalPermPages}
                  </span>
                  <button
                    disabled={permPage === totalPermPages}
                    onClick={() => setPermPage(prev => Math.min(prev + 1, totalPermPages))}
                    className="px-4 py-2 bg-theme-element border border-theme-accent/20 text-foreground text-xs font-black rounded-lg transition-all hover:bg-theme-element-sec disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: USER ACCOUNTS CONTROL ───────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-theme-accent/10 bg-theme-element-sec/50">
              <h3 className="text-xl font-black text-foreground tracking-tight">System Users & Access Levels</h3>
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Active Accounts Grid</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-accent/10 bg-theme-element-sec/20 text-xs font-black uppercase tracking-wider text-foreground/60">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">User Role</th>
                    <th className="py-4 px-6 text-center">Auth Status</th>
                    <th className="py-4 px-6 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-accent/5">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm font-semibold text-foreground/50">
                        No user accounts registered.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-theme-element-sec/20 transition-colors text-sm font-semibold text-foreground/80">
                        <td className="py-4 px-6">
                          {item.firstName} {item.lastName}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">{item.email}</td>
                        <td className="py-4 px-6">
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                            className="bg-theme-element-sec border border-theme-accent/25 text-foreground font-black uppercase tracking-wider text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-theme-action"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.isVerified ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVerified ? 'bg-green-500' : 'bg-orange-500'}`} />
                            {item.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(item.id)}
                            className="p-2 text-foreground/45 hover:text-red-500 transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
