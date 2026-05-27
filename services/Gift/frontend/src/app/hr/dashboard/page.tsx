"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, FileText, CheckCircle2, Clock, Box, ShieldCheck, Mail, User, Info, ArrowUpRight, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HRDashboard() {
    const { user } = useAuthStore();
    const [links, setLinks] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/share/analytics"),
            api.get("/orders/hr")
        ])
            .then(([lRes, oRes]) => {
                setLinks(lRes.data.links || []);
                setOrders(oRes.data || []);
            })
            .catch(() => console.error("Failed to load HR dashboard statistics"))
            .finally(() => setLoading(false));
    }, []);

    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

    const stats = [
        { title: "Gifts Created", value: links.length, desc: "Total shared gift link templates", icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
        { title: "Submitted Claims", value: orders.length, desc: "Employee forms received", icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Pending Approvals", value: pendingOrdersCount, desc: "Dispatched to Super Admin", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                    <Briefcase className="w-8 h-8 text-violet-600" /> HR Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here is your dashboard analytics overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <Card key={s.title} className="hover:shadow-md transition-shadow border rounded-2xl bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">{s.title}</CardTitle>
                            <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{loading ? "..." : s.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submissions Section */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="rounded-2xl bg-card border">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Box className="w-5 h-5 text-violet-600" /> Claimed Employee Forms
                        </CardTitle>
                        <CardDescription>
                            See live claims filled out by company users. These selections are forwarded to Admin automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                <div className="h-16 bg-muted animate-pulse rounded-xl" />
                                <div className="h-16 bg-muted animate-pulse rounded-xl" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
                                <Info className="w-10 h-10 text-muted-foreground/35" />
                                <p className="text-sm">No employee has claimed any gift links yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orders.map((order) => (
                                    <div key={order._id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5 text-violet-500" /> {order.employeeName}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] rounded-md font-mono bg-muted/40">
                                                    ID: {order.employeeId}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5" /> {order.employeeEmail}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                📦 Products Selected: <span className="font-medium text-foreground">{order.selectedProducts?.map((p: any) => p.title).join(", ") || "None"}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground/80 truncate">
                                                📍 Delivery Address: <span className="italic">{order.address}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {order.status === 'Pending' && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/10 animate-pulse">
                                                    <Clock className="w-3.5 h-3.5" /> Pending approval
                                                </div>
                                            )}
                                            {order.status === 'Approved' && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Approved by Admin
                                                </div>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Shipped
                                                </div>
                                            )}
                                            {(order.status === 'Rejected' || order.status === 'Cancelled') && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/10">
                                                    <XCircle className="w-3.5 h-3.5" /> Rejected by Admin
                                                </div>
                                            )}
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                Status: {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
