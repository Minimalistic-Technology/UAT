"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Newspaper,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  User as UserIcon,
  Calendar,
  Clock,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

const BlogHistoryPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'createdAt',
    direction: 'desc'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/posts/all');
      setPosts(res.data.data.items || []);
    } catch (e) {
      toast.error('Failed to load blog history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? The author will be notified.")) return;

    setActionLoading(postId);
    try {
      await api.delete(`/admin/posts/${postId}`);
      toast.success("Post deleted and author notified");
      setPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
    } catch (e) {
      toast.error("Failed to delete post");
    } finally {
      setActionLoading(null);
    }
  };

  // Sort and Filter Logic
  const processedPosts = useMemo(() => {
    let filtered = [...posts];

    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(q) ||
        `${post.authorId?.firstName} ${post.authorId?.lastName}`.toLowerCase().includes(q) ||
        post.authorId?.email?.toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'user') {
          aValue = `${a.authorId?.firstName} ${a.authorId?.lastName}`.toLowerCase();
          bValue = `${b.authorId?.firstName} ${b.authorId?.lastName}`.toLowerCase();
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [posts, searchQuery, statusFilter, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-500/20">Published</span>;
      case 'pending': return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-wider rounded-lg border border-orange-500/20">Pending</span>;
      case 'rejected': return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-500/20">Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-theme-element-sec text-foreground/70 text-[10px] font-black uppercase tracking-wider rounded-lg border border-theme-accent/20">{status}</span>;
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <Loader2 className="animate-spin text-theme-action mb-4" size={40} />
      <p className="text-foreground/50 font-bold animate-pulse">Fetching global blog history...</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-theme-element-sec flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-theme-element transition-all active:scale-95 border border-theme-accent/10">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-theme-action/10 rounded-xl flex items-center justify-center text-theme-action">
                <Newspaper size={18} />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Blog History</h1>
            </div>
            <p className="text-foreground/50 text-sm font-medium mt-1">Detailed oversight of all posts across the platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input
              type="text"
              placeholder="Search user or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-theme-element border border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:border-theme-action focus:ring-4 focus:ring-theme-action/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-theme-element border border-theme-accent/20 p-1 rounded-2xl shadow-sm">
            {['all', 'published', 'pending', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${statusFilter === s ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:text-foreground/70'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] shadow-xl shadow-foreground/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-theme-element-sec border-b border-theme-accent/10">
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Post Details
                    {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => requestSort('user')}
                >
                  <div className="flex items-center gap-2">
                    Author
                    {sortConfig?.key === 'user' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => requestSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Posted At
                    {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-accent/10">
              {processedPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-foreground/50">
                      <div className="w-20 h-20 bg-theme-element-sec rounded-full flex items-center justify-center mb-6">
                        <Search size={32} />
                      </div>
                      <p className="text-lg font-black text-foreground">No blogs found</p>
                      <p className="text-sm font-medium mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processedPosts.map((post) => {
                  const postId = post.id || post._id;
                  return (
                    <tr key={postId} className="group hover:bg-theme-element-sec/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="max-w-[300px]">
                          <p className="text-sm font-black text-foreground line-clamp-1 group-hover:text-theme-action transition-colors">{post.title}</p>
                          <p className="text-[10px] font-bold text-foreground/50 mt-1 uppercase tracking-widest">{post.category || 'Uncategorized'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-theme-element-sec rounded-xl flex items-center justify-center text-foreground/50">
                            <UserIcon size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground">
                              {post.authorId?.firstName} {post.authorId?.lastName}
                            </span>
                            <span className="text-[10px] font-bold text-foreground/50 lowercase">{post.authorId?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-black text-foreground/70">
                            <Calendar size={14} className="text-foreground/50" />
                            {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
                            <Clock size={14} className="text-foreground/50" />
                            {format(new Date(post.createdAt), 'hh:mm a')}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center w-9 h-9 bg-theme-element border border-theme-accent/20 rounded-xl text-foreground/50 hover:text-theme-action hover:border-theme-action/30 hover:bg-theme-action/5 transition-all active:scale-95 shadow-sm"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(postId)}
                            disabled={actionLoading === postId}
                            className="inline-flex items-center justify-center w-9 h-9 bg-theme-element border border-theme-accent/20 rounded-xl text-foreground/50 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                          >
                            {actionLoading === postId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-theme-element-sec px-8 py-5 border-t border-theme-accent/10 flex items-center justify-between">
          <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">
            Total Entries: <span className="text-foreground">{processedPosts.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Live Database Connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogHistoryPage;
