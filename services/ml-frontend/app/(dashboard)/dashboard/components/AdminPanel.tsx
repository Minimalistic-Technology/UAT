"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
    <div className="space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Admin Badge */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
          <ShieldAlert size={18} />
        </div>
        <h2 className="text-xl font-black text-gray-900">Admin Control Panel</h2>
      </div>

      {/* Auto-Approve Toggle Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
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
          <div className="grid gap-4">
            {pendingPosts.map((post: any) => (
              <div key={post._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    By {post.authorId?.firstName} {post.authorId?.lastName} · {post.authorId?.email}
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

export default AdminPanel;
