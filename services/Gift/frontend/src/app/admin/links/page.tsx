"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Copy, ExternalLink, Eye, Calendar, CheckCircle2, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/axios";

export default function LinksPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
    const [creatorFilter, setCreatorFilter] = useState("all");

    useEffect(() => { fetchLinks(); }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await api.get("/share/analytics");
            setLinks(data.links || []);
        } catch { toast.error("Failed to load links"); }
        finally { setLoading(false); }
    };

    const handleDelete = (id: string) => {
        setLinkToDelete(id);
        setConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!linkToDelete) return;
        try {
            await api.delete(`/share/${linkToDelete}`);
            toast.success("Link deleted successfully!");
            setLinks(l => l.filter(x => x._id !== linkToDelete));
        } catch {
            toast.error("Failed to delete link");
        } finally {
            setConfirmOpen(false);
            setLinkToDelete(null);
        }
    };

    const filteredLinks = links.filter(link => {
        if (creatorFilter === "admin") return link.adminId?.role === "Admin";
        if (creatorFilter === "hr") return link.adminId?.role === "HRAdmin";
        return true;
    });

    const copyLink = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gift Links</h1>
                    <p className="text-muted-foreground mt-1">Manage public links and view analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={creatorFilter}
                        onChange={e => setCreatorFilter(e.target.value)}
                        className="text-xs h-9 px-3 border border-input rounded-xl bg-background text-muted-foreground focus-visible:outline-none focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="all">All Creators</option>
                        <option value="admin">Created by Admins</option>
                        <option value="hr">Created by HR</option>
                    </select>
                    <Link href="/admin/links/new">
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Create Gift Link</Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            ) : filteredLinks.length === 0 ? (
                <Card className="py-16 text-center">
                    <p className="text-muted-foreground">No gift links found.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredLinks.map((link, i) => (
                        <motion.div key={link._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-mono truncate max-w-[150px]">/{link.token?.slice(0, 16)}...</CardTitle>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                                                <span className={`px-1.5 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wide ${link.adminId?.role === "Admin" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-purple-500/10 text-purple-600 border border-purple-500/20"}`}>
                                                    {link.adminId?.role === "Admin" ? "Admin" : "HR"}
                                                </span>
                                                <span className="truncate max-w-[80px]" title={link.adminId?.name}>
                                                    {link.adminId?.name || "System"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={link.isActive ? "default" : "secondary"} className="gap-1">
                                                {link.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {link.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(link._id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{link.totalViews || 0} views</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{link.expiryDate ? new Date(link.expiryDate).toLocaleDateString() : "Never"}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{link.selectedProducts?.length || 0} products bundled</p>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => copyLink(link.token)}>
                                            <Copy className="w-3.5 h-3.5" /> Copy
                                        </Button>
                                        <Link href={`/share/${link.token}`} target="_blank" className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full gap-1.5">
                                                <ExternalLink className="w-3.5 h-3.5" /> View
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
            {/* Link Delete Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md p-6 bg-card border rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5 animate-bounce-once" /> Confirm Link Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            Are you sure you want to delete this shared link? Employees will no longer be able to select gifts using this link. This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeDelete} className="rounded-xl shadow-md">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
