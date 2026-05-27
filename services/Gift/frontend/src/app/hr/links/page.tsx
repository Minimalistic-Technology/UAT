"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Copy, ExternalLink, Eye, Calendar, CheckCircle2, XCircle, Link2, Trash2, AlertTriangle } from "lucide-react";
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

export default function HRLinksPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

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

    const copyLink = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Link2 className="w-8 h-8 text-violet-600" /> Gift Links
                    </h1>
                    <p className="text-muted-foreground mt-1">{links.length} active gift links assigned by you</p>
                </div>
                <Link href="/hr/links/new">
                    <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"><Plus className="w-4 h-4" /> Create Link</Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
                </div>
            ) : links.length === 0 ? (
                <Card className="py-16 text-center border-dashed rounded-2xl border-violet-500/20 bg-violet-500/5">
                    <CardContent className="flex flex-col items-center gap-3">
                        <Link2 className="w-10 h-10 text-violet-500/50" />
                        <p className="text-muted-foreground">No share links created yet.</p>
                        <Link href="/hr/links/new">
                            <Button className="mt-2 gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                                <Plus className="w-4 h-4" /> Create First Link
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {links.map((link, i) => (
                        <motion.div key={link._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className="hover:shadow-md transition-shadow rounded-2xl border hover:border-violet-500/20">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-mono truncate max-w-[160px]">/{link.token?.slice(0, 16)}...</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={link.isActive ? "default" : "secondary"} className={`gap-1 ${link.isActive ? "bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10" : ""}`}>
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
                                            <Eye className="w-3.5 h-3.5 text-violet-500" />
                                            <span>{link.totalViews || 0} views</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-violet-500" />
                                            <span>{link.expiryDate ? new Date(link.expiryDate).toLocaleDateString() : "Never"}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{link.selectedProducts?.length || 0} products bundled</p>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl hover:text-violet-600 hover:border-violet-300" onClick={() => copyLink(link.token)}>
                                            <Copy className="w-3.5 h-3.5" /> Copy
                                        </Button>
                                        <Link href={`/share/${link.token}`} target="_blank" className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full gap-1.5 rounded-xl">
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
                            <AlertTriangle className="w-5 h-5 animate-bounce-once animate-duration-500" /> Confirm Link Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
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
