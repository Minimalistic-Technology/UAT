"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Link2, Eye, Plus, TrendingUp, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ products: 0, links: 0, views: 0 });
    const [recentLinks, setRecentLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/products"),
            api.get("/share/analytics").catch(() => ({ data: { links: [] } })),
        ]).then(([pRes, lRes]) => {
            const links = lRes.data.links || [];
            const totalViews = links.reduce((sum: number, l: any) => sum + (l.totalViews || 0), 0);
            setStats({ products: pRes.data.length, links: links.length, views: totalViews });
            setRecentLinks(links.slice(0, 3));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const statCards = [
        { title: "Total Products", value: stats.products, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Active Links", value: stats.links, icon: Link2, color: "text-violet-500", bg: "bg-violet-500/10" },
        { title: "Total Views", value: stats.views, icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Good day, {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products/new">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Product
                        </Button>
                    </Link>
                    <Link href="/admin/links/new">
                        <Button size="sm" className="gap-2">
                            <Link2 className="w-4 h-4" /> New Link
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map(({ title, value, icon: Icon, color, bg }, i) => (
                    <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                                <div className={`p-2 rounded-lg ${bg}`}>
                                    <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <div className="text-3xl font-bold">{value}</div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Links & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Recent Share Links
                        </CardTitle>
                        <CardDescription>Your latest generated share links</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : recentLinks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No links yet. Create your first one!</p>
                        ) : (
                            recentLinks.map((link) => (
                                <div key={link._id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                                    <div>
                                        <p className="text-sm font-mono font-medium">/{link.token?.slice(0, 12)}...</p>
                                        <p className="text-xs text-muted-foreground">{link.selectedProducts?.length} products • {link.totalViews} views</p>
                                    </div>
                                    <Badge variant={link.isActive ? "default" : "secondary"}>
                                        {link.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-primary" /> Quick Actions
                        </CardTitle>
                        <CardDescription>Commonly used actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/products/new">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                                <Package className="w-4 h-4 text-blue-500" />
                                Add New Product
                            </Button>
                        </Link>
                        <Link href="/admin/links/new">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl mt-2">
                                <Link2 className="w-4 h-4 text-violet-500" />
                                Generate Share Link
                            </Button>
                        </Link>
                        <Link href="/admin/products">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl mt-2">
                                <Eye className="w-4 h-4 text-emerald-500" />
                                View All Products
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
