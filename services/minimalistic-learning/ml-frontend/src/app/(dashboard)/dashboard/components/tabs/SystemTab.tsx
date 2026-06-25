"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, Loader2, BookOpen, ShieldCheck, Clock, FileText, User as UserIcon } from "lucide-react";
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
        Promise.all([
            api.get('/admin/settings'),
            api.get('/admin/posts/pending')
        ]).then(([settingsRes, pendingRes]) => {
            if (!isMounted) return;
            setAutoApprove(settingsRes.data.data.autoApprovePost);
            setResourceHub(settingsRes.data.data.resourceHubEnabled ?? true);
            setPendingPosts(pendingRes.data.data.items || []);
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            toast.error('Failed to load system data');
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    const handleToggle = async () => {
        if (autoApprove === null) return;
        const previous = autoApprove;
        setAutoApprove(!previous);
        toast.success(`Auto-approve ${!previous ? 'enabled' : 'disabled'}`);
        setIsToggling(true);
        try {
            await api.patch('/admin/settings', { autoApprovePost: !previous });
        } catch {
            setAutoApprove(previous);
            toast.error('Failed to update settings');
        } finally {
            setIsToggling(false);
        }
    };

    const handleToggleHub = async () => {
        if (resourceHub === null) return;
        const previous = resourceHub;
        setResourceHub(!previous);
        toast.success(`Resource Hub ${!previous ? 'enabled' : 'disabled'} for users`);
        setIsTogglingHub(true);
        try {
            await api.patch('/admin/settings', { resourceHubEnabled: !previous });
        } catch {
            setResourceHub(previous);
            toast.error('Failed to update Resource Hub setting');
        } finally {
            setIsTogglingHub(false);
        }
    };

    const handleApprove = async (postId: string) => {
        const previousPending = pendingPosts;
        setPendingPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
        setActionLoading(postId + '-approve');
        toast.success('Post approved and published!');
        try {
            await api.patch(`/admin/posts/${postId}/approve`);
        } catch {
            setPendingPosts(previousPending);
            toast.error('Failed to approve post');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (postId: string) => {
        const previousPending = pendingPosts;
        setPendingPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
        setActionLoading(postId + '-reject');
        toast.success('Post rejected');
        try {
            await api.patch(`/admin/posts/${postId}/reject`);
        } catch {
            setPendingPosts(previousPending);
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
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {autoApprove ? "Automatic Publishing: Posts submitted by users instantly go live without requiring manual review." : "Manual Moderation: All new submissions are placed in a queue awaiting admin approval."}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${autoApprove ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${autoApprove ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                            {autoApprove ? "Status: Live" : "Status: Moderated"}
                        </div>
                    </div>
                </div>

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
                            {resourceHub ? "The Resource Hub is currently visible and accessible to all visitors in the main navigation." : "The Resource Hub is hidden globally. Useful when updating content or undergoing maintenance."}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest self-start ${resourceHub ? 'bg-theme-action/10 text-theme-action' : 'bg-theme-element-sec text-foreground/50'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${resourceHub ? 'bg-theme-action animate-pulse' : 'bg-foreground/50'}`} />
                            {resourceHub ? "Public" : "Hidden"}
                        </div>
                    </div>
                </div>
            </div>

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
                                                <Button variant="primary" onClick={() => handleApprove(postId)} disabled={!!actionLoading} className="px-5 py-2.5 text-xs font-black shadow-sm group/btn">
                                                    {actionLoading === postId + '-approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />}
                                                    Approve
                                                </Button>
                                                <Button variant="none" onClick={() => handleReject(postId)} disabled={!!actionLoading} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-element hover:bg-red-500/10 text-foreground hover:text-red-500 text-xs font-black rounded-xl border border-theme-accent/20 hover:border-red-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group/btn">
                                                    {actionLoading === postId + '-reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="group-hover/btn:scale-110 transition-transform text-red-500" />}
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
