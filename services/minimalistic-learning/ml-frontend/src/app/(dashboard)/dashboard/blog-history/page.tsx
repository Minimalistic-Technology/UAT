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
  Trash2,
  ChevronLeft,
  ChevronRight,
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>({
    key: "createdAt",
    direction: "desc",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/posts/all");
      setPosts(res.data.data.items || []);
    } catch (e) {
      toast.error("Failed to load blog history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (postId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? The author will be notified.",
      )
    )
      return;

    setActionLoading(postId);
    try {
      await api.delete(`/admin/posts/${postId}`);
      toast.success("Post deleted and author notified");
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
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
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          `${post.authorId?.firstName} ${post.authorId?.lastName}`
            .toLowerCase()
            .includes(q) ||
          post.authorId?.email?.toLowerCase().includes(q),
      );
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "user") {
          aValue =
            `${a.authorId?.firstName} ${a.authorId?.lastName}`.toLowerCase();
          bValue =
            `${b.authorId?.firstName} ${b.authorId?.lastName}`.toLowerCase();
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [posts, searchQuery, statusFilter, sortConfig]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(processedPosts.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortConfig]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedPosts.slice(start, start + itemsPerPage);
  }, [processedPosts, currentPage]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-green-500 uppercase">
            Published
          </span>
        );
      case "pending":
        return (
          <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-orange-500 uppercase">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-red-500 uppercase">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-theme-element-sec text-foreground/70 border-theme-accent/20 rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12">
        <Loader2 className="text-theme-action mb-4 animate-spin" size={40} />
        <p className="text-foreground/50 animate-pulse font-bold">
          Fetching global blog history...
        </p>
      </div>
    );

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="bg-theme-element-sec text-foreground/50 hover:text-foreground hover:bg-theme-element border-theme-accent/10 flex h-10 w-10 items-center justify-center rounded-xl border transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-theme-action/10 text-theme-action flex h-8 w-8 items-center justify-center rounded-xl">
                <Newspaper size={18} />
              </div>
              <h1 className="text-foreground text-2xl font-black tracking-tight">
                Blog History
              </h1>
            </div>
            <p className="text-foreground/50 mt-1 text-sm font-medium">
              Detailed oversight of all posts across the platform
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search
              className="text-foreground/50 absolute top-1/2 left-4 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search user or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-theme-element border-theme-accent/20 text-foreground focus:border-theme-action focus:ring-theme-action/10 w-full rounded-2xl border py-3 pr-4 pl-11 text-sm font-bold shadow-sm transition-all focus:ring-4 focus:outline-none"
            />
          </div>
          <div className="bg-theme-element border-theme-accent/20 flex items-center gap-2 rounded-2xl border p-1 shadow-sm">
            {["all", "published", "pending", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-4 py-2 text-[10px] font-black tracking-wider uppercase transition-all ${
                  statusFilter === s
                    ? "bg-foreground text-background shadow-md"
                    : "text-foreground/50 hover:text-foreground/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-theme-element border-theme-accent/20 shadow-foreground/5 overflow-hidden rounded-[2.5rem] border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-theme-element-sec border-theme-accent/10 border-b">
                <th
                  className="text-foreground/50 hover:text-foreground cursor-pointer px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors"
                  onClick={() => requestSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Post Details
                    {sortConfig?.key === "title" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className="text-foreground/50 hover:text-foreground cursor-pointer px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors"
                  onClick={() => requestSort("user")}
                >
                  <div className="flex items-center gap-2">
                    Author
                    {sortConfig?.key === "user" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th
                  className="text-foreground/50 hover:text-foreground cursor-pointer px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Posted At
                    {sortConfig?.key === "createdAt" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
                <th className="text-foreground/50 px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase">
                  Status
                </th>
                <th className="text-foreground/50 px-8 py-5 text-right text-[10px] font-black tracking-[0.2em] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-theme-accent/10 divide-y">
              {paginatedPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="text-foreground/50 flex flex-col items-center justify-center">
                      <div className="bg-theme-element-sec mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <Search size={32} />
                      </div>
                      <p className="text-foreground text-lg font-black">
                        No blogs found
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((post) => {
                  const postId = post.id || post._id;
                  return (
                    <tr
                      key={postId}
                      className="group hover:bg-theme-element-sec/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="max-w-[300px]">
                          <p className="text-foreground group-hover:text-theme-action line-clamp-1 text-sm font-black transition-colors">
                            {post.title}
                          </p>
                          <p className="text-foreground/50 mt-1 text-[10px] font-bold tracking-widest uppercase">
                            {post.category || "Uncategorized"}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-theme-element-sec text-foreground/50 flex h-9 w-9 items-center justify-center rounded-xl">
                            <UserIcon size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground text-sm font-black">
                              {post.authorId?.firstName}{" "}
                              {post.authorId?.lastName}
                            </span>
                            <span className="text-foreground/50 text-[10px] font-bold lowercase">
                              {post.authorId?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="text-foreground/70 flex items-center gap-2 text-xs font-black">
                            <Calendar
                              size={14}
                              className="text-foreground/50"
                            />
                            {format(new Date(post.createdAt), "MMM dd, yyyy")}
                          </div>
                          <div className="text-foreground/50 flex items-center gap-2 text-[10px] font-bold">
                            <Clock size={14} className="text-foreground/50" />
                            {format(new Date(post.createdAt), "hh:mm a")}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(postId)}
                            disabled={actionLoading === postId}
                            className="bg-theme-element border-theme-accent/20 text-foreground/50 inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500 disabled:opacity-50"
                          >
                            {actionLoading === postId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
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

        <div className="bg-theme-element-sec border-theme-accent/10 flex flex-col items-center justify-between gap-4 border-t px-8 py-4 sm:flex-row">
          <p className="text-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, processedPosts.length)} of{" "}
            <span className="text-foreground">{processedPosts.length}</span>
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-foreground/50 hover:bg-theme-element hover:text-foreground rounded-xl p-2 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-foreground flex items-center gap-1 px-4 text-xs font-bold">
                <span className="text-theme-action">{currentPage}</span>
                <span className="text-foreground/30">/</span>
                <span>{totalPages}</span>
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="text-foreground/50 hover:bg-theme-element hover:text-foreground rounded-xl p-2 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <p className="text-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
              Live Database Connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogHistoryPage;
