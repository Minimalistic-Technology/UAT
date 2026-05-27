"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Gift, LogOut, PackageOpen, ExternalLink, Calendar, CheckCircle2, Box, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import UserNavbar from "@/components/UserNavbar";

export default function UserProfilePage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [links, setLinks] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'assigned' | 'claimed'>('assigned');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated) return router.push("/login");

        Promise.all([
            api.get("/share/my-links"),
            api.get("/orders/my-orders")
        ])
            .then(([linksRes, ordersRes]) => {
                setLinks(linksRes.data || []);
                setOrders(ordersRes.data || []);
            })
            .catch(() => console.error("Failed to load profile dashboard items"))
            .finally(() => setLoading(false));
    }, [isAuthenticated, router, mounted]);

    if (!mounted) return null;
    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen bg-background">
            <UserNavbar />

            {/* Profile Overview */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Sidebar Profile */}
                    <div className="w-full md:w-64 shrink-0 space-y-6">
                        <div className="flex flex-col items-center text-center p-6 border rounded-2xl bg-card">
                            <Avatar className="w-20 h-20 mb-3 shadow-lg">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="font-semibold text-lg">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Badge variant="secondary" className="mt-4">
                                {user.role === "Admin" ? "Super Admin" : user.role === "HRAdmin" ? "HR Admin" : "Registered User"}
                            </Badge>
                        </div>
                    </div>

                    {/* Main Content - Assigned & Claimed Gifts */}
                    <div className="flex-1 min-w-0 w-full space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Profile Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Manage your gift configurations, assigned bundles, and delivery requests.</p>
                        </div>

                        {/* Animated Navigation Tabs */}
                        <div className="flex gap-4 border-b border-border pb-px">
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors relative ${activeTab === 'assigned' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                Assigned Links ({links.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('claimed')}
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors relative ${activeTab === 'claimed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                Claimed Gifts ({orders.length})
                            </button>
                        </div>

                        <Separator className="my-2" />

                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-24 bg-muted animate-pulse rounded-xl" />
                                <div className="h-24 bg-muted animate-pulse rounded-xl" />
                            </div>
                        ) : activeTab === 'assigned' ? (
                            /* Sub-Tab 1: Assigned Links */
                            links.length === 0 ? (
                                <div className="text-center py-16 border rounded-2xl bg-muted/20 border-dashed">
                                    <PackageOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                                    <h3 className="font-medium text-lg">No gifts assigned yet</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        When HR or an Admin assigns a gift collection to you, it will appear right here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {links.map((link, i) => (
                                        <motion.div key={link._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                            <Card className="hover:border-primary/40 transition-colors rounded-2xl">
                                                <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-center">
                                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Gift className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left">
                                                        <h3 className="font-semibold">Gift Collection</h3>
                                                        <p className="text-sm text-muted-foreground mb-1">Assigned by {link.adminId?.name || "HR/Admin"}</p>
                                                        <div className="flex gap-3 justify-center sm:justify-start text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><PackageOpen className="w-3.5 h-3.5" /> {link.selectedProducts?.length || 0} Items</span>
                                                            {link.expiryDate && (
                                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Until {new Date(link.expiryDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Link href={`/share/${link.token}`}>
                                                        <Button className="w-full sm:w-auto gap-2 shadow-sm rounded-full px-6 bg-primary">
                                                            Unwrap Gifts <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* Sub-Tab 2: Claimed Orders */
                            orders.length === 0 ? (
                                <div className="text-center py-16 border rounded-2xl bg-muted/20 border-dashed">
                                    <Box className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                                    <h3 className="font-medium text-lg">No claims submitted yet</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        Open an assigned gift link and complete the form submission to track your delivery here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {orders.map((order, i) => (
                                        <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                            <Card className="hover:border-primary/20 transition-all rounded-2xl">
                                                <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-center">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${order.status === 'Approved' || order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600' :
                                                                'bg-amber-500/10 text-amber-600'
                                                        }`}>
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-base truncate">Gift Claim Selection</h3>
                                                            <Badge className={`w-fit py-0 px-2.5 rounded-full ${order.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/10 border-none' :
                                                                    order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none' :
                                                                        order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 border-none' :
                                                                            'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-none'
                                                                }`}>
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate mb-1">Address: {order.address}</p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start text-xs text-muted-foreground mt-2">
                                                            <span className="flex items-center gap-1"><PackageOpen className="w-3.5 h-3.5 text-primary" /> {order.selectedProducts?.length || 0} Products</span>
                                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> Claimed: {new Date(order.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

// Needed Badge locally just for ease
function Badge({ children, className, variant = "default" }: any) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            } ${className}`}>
            {children}
        </span>
    );
}
