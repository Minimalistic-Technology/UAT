"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Copy, ExternalLink, Eye, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function LinksPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLinks(); }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await api.get("/share/analytics");
            setLinks(data.links || []);
        } catch { toast.error("Failed to load links"); }
        finally { setLoading(false); }
    };

    const copyLink = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Share Links</h1>
                    <p className="text-muted-foreground mt-1">{links.length} links created</p>
                </div>
                <Link href="/admin/links/new">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Create Link</Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
                </div>
            ) : links.length === 0 ? (
                <Card className="py-16 text-center">
                    <CardContent>
                        <p className="text-muted-foreground">No share links yet.</p>
                        <Link href="/admin/links/new"><Button className="mt-4 gap-2"><Plus className="w-4 h-4" /> Create First Link</Button></Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {links.map((link, i) => (
                        <motion.div key={link._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-mono truncate max-w-[160px]">/{link.token?.slice(0, 16)}...</CardTitle>
                                        <Badge variant={link.isActive ? "default" : "secondary"} className="gap-1">
                                            {link.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {link.isActive ? "Active" : "Inactive"}
                                        </Badge>
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
        </div>
    );
}
