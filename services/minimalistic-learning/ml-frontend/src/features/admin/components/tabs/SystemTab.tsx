"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ShieldCheck,
  Clock,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ModernSwitch } from "./ModernSwitch";

export default function SystemTab() {
  const [autoApprove, setAutoApprove] = useState<boolean | null>(null);
  const [resourceHub, setResourceHub] = useState<boolean | null>(null);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isTogglingHub, setIsTogglingHub] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.get("/admin/settings"), api.get("/admin/posts/pending")])
      .then(([settingsRes, pendingRes]) => {
        if (!isMounted) return;
        setAutoApprove(settingsRes.data.data.autoApprovePost);
        setResourceHub(settingsRes.data.data.resourceHubEnabled ?? true);
        setPendingPosts(pendingRes.data.data.items || []);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Failed to load system data");
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async () => {
    if (autoApprove === null) return;
    const previous = autoApprove;
    setAutoApprove(!previous);
    toast.success(`Auto-approve ${!previous ? "enabled" : "disabled"}`);
    setIsToggling(true);
    try {
      await api.patch("/admin/settings", { autoApprovePost: !previous });
    } catch {
      setAutoApprove(previous);
      toast.error("Failed to update settings");
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleHub = async () => {
    if (resourceHub === null) return;
    const previous = resourceHub;
    setResourceHub(!previous);
    toast.success(
      `Resource Hub ${!previous ? "enabled" : "disabled"} for users`,
    );
    setIsTogglingHub(true);
    try {
      await api.patch("/admin/settings", { resourceHubEnabled: !previous });
    } catch {
      setResourceHub(previous);
      toast.error("Failed to update Resource Hub setting");
    } finally {
      setIsTogglingHub(false);
    }
  };

  const handleApprove = async (postId: string) => {
    const previousPending = pendingPosts;
    setPendingPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
    setActionLoading(postId + "-approve");
    toast.success("Post approved and published!");
    try {
      await api.patch(`/admin/posts/${postId}/approve`);
    } catch {
      setPendingPosts(previousPending);
      toast.error("Failed to approve post");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: string) => {
    const previousPending = pendingPosts;
    setPendingPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
    setActionLoading(postId + "-reject");
    toast.success("Post rejected");
    try {
      await api.patch(`/admin/posts/${postId}/reject`);
    } catch {
      setPendingPosts(previousPending);
      toast.error("Failed to reject post");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-16 w-16">
          <div className="border-theme-accent/20 absolute inset-0 rounded-full border-4" />
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-accent/50 relative overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
          <div
            className={`absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-all duration-500 dark:opacity-20 ${autoApprove ? "bg-green-500" : "bg-orange-500"}`}
          />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6 flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${autoApprove ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}
              >
                {autoApprove ? (
                  <ShieldCheck size={24} />
                ) : (
                  <ShieldAlert size={24} />
                )}
              </div>
              <ModernSwitch
                checked={autoApprove!}
                onChange={handleToggle}
                loading={isToggling}
                colorClass="bg-green-500"
              />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-black">
              Publishing Mode
            </h3>
            <p className="text-foreground/70 mb-6 flex-1 text-sm leading-relaxed font-medium">
              {autoApprove
                ? "Automatic Publishing: Posts submitted by users instantly go live without requiring manual review."
                : "Manual Moderation: All new submissions are placed in a queue awaiting admin approval."}
            </p>
            <div
              className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-1.5 text-xs font-black tracking-widest uppercase ${autoApprove ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${autoApprove ? "animate-pulse bg-green-500" : "bg-orange-500"}`}
              />
              {autoApprove ? "Status: Live" : "Status: Moderated"}
            </div>
          </div>
        </div>

        <div className="group bg-theme-element border-theme-accent/20 hover:border-theme-accent/50 relative overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
          <div
            className={`absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-all duration-500 dark:opacity-20 ${resourceHub ? "bg-theme-action" : "bg-foreground/50"}`}
          />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6 flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${resourceHub ? "bg-theme-action/10 text-theme-action" : "bg-theme-element-sec text-foreground/50"}`}
              >
                <BookOpen size={24} />
              </div>
              <ModernSwitch
                checked={resourceHub!}
                onChange={handleToggleHub}
                loading={isTogglingHub}
                colorClass="bg-theme-action"
              />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-black">
              Resource Hub Visibility
            </h3>
            <p className="text-foreground/70 mb-6 flex-1 text-sm leading-relaxed font-medium">
              {resourceHub
                ? "The Resource Hub is currently visible and accessible to all visitors in the main navigation."
                : "The Resource Hub is hidden globally. Useful when updating content or undergoing maintenance."}
            </p>
            <div
              className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-1.5 text-xs font-black tracking-widest uppercase ${resourceHub ? "bg-theme-action/10 text-theme-action" : "bg-theme-element-sec text-foreground/50"}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${resourceHub ? "bg-theme-action animate-pulse" : "bg-foreground/50"}`}
              />
              {resourceHub ? "Public" : "Hidden"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-element border-theme-accent/20 overflow-hidden rounded-[2.5rem] border shadow-sm">
        <div className="border-theme-accent/10 bg-theme-element-sec/50 flex flex-col items-start justify-between gap-4 border-b p-8 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                <Clock size={16} />
              </div>
              <h3 className="text-foreground text-xl font-black tracking-tight">
                Content Moderation Queue
              </h3>
            </div>
            <p className="text-foreground/50 ml-11 text-xs font-bold tracking-widest uppercase">
              Review & Publish
            </p>
          </div>
          {pendingPosts.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
                {pendingPosts.length} Pending
              </span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {pendingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 shadow-inner">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h4 className="text-foreground mb-2 text-xl font-black">
                Inbox Zero
              </h4>
              <p className="text-foreground/70 max-w-sm text-sm font-medium">
                No posts awaiting approval. Enjoy the clean state!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingPosts.map((post: any) => {
                const postId = post.id || post._id;
                return (
                  <div
                    key={postId}
                    className="group bg-theme-element-sec border-theme-accent/10 hover:border-theme-action/50 relative rounded-2xl border p-5 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="bg-theme-element text-foreground/50 border-theme-accent/20 group-hover:bg-theme-action/10 group-hover:text-theme-action group-hover:border-theme-action/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-foreground hover:text-theme-action mb-1.5 block truncate pr-4 text-lg leading-tight font-black transition-colors"
                          >
                            {post.title}
                          </Link>
                          <div className="text-foreground/50 flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                            <span className="flex items-center gap-1.5">
                              <UserIcon size={12} /> {post.authorId?.firstName}{" "}
                              {post.authorId?.lastName}
                            </span>
                            <span className="bg-foreground/20 h-1 w-1 rounded-full" />
                            <span>
                              {post.createdAt
                                ? formatDistanceToNow(
                                    new Date(post.createdAt),
                                    { addSuffix: true },
                                  )
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-theme-accent/10 flex shrink-0 items-center gap-2.5 border-t pt-3 md:ml-auto md:border-none md:pt-0">
                        <Button
                          variant="primary"
                          onClick={() => handleApprove(postId)}
                          disabled={!!actionLoading}
                          className="group/btn px-5 py-2.5 text-xs font-black shadow-sm"
                        >
                          {actionLoading === postId + "-approve" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle
                              size={16}
                              className="transition-transform group-hover/btn:scale-110"
                            />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="none"
                          onClick={() => handleReject(postId)}
                          disabled={!!actionLoading}
                          className="bg-theme-element text-foreground border-theme-accent/20 group/btn flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-black transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === postId + "-reject" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle
                              size={16}
                              className="text-red-500 transition-transform group-hover/btn:scale-110"
                            />
                          )}
                          Reject
                        </Button>
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
  );
}
