"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Package, Mail, User, Calendar, MapPin, Notebook, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders/admin");
            setOrders(data);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            toast.success(`Claim status updated to ${newStatus}`);
            fetchOrders();
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gift Claims & Orders</h1>
                    <p className="text-muted-foreground mt-1">Review, approve, and track delivery coordinates for claimed employee gifts.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchOrders} className="rounded-xl">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <Card className="py-16 text-center border-dashed rounded-2xl bg-muted/10">
                    <CardContent className="text-muted-foreground text-sm">
                        No claims have been submitted by employees yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <Card key={order._id} className="rounded-2xl border transition-all hover:shadow-sm">
                            <CardContent className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="space-y-2 flex-grow min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-base flex items-center gap-1.5 text-foreground">
                                            <User className="w-4 h-4 text-primary" /> {order.employeeName}
                                        </span>
                                        <Badge variant="outline" className="text-xs rounded-md">ID: {order.employeeId}</Badge>
                                        <Badge className={`text-xs ml-auto lg:ml-0 font-bold ${order.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/10 border-none' :
                                            order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none' :
                                                order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 border-none' :
                                                    'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-none'
                                            }`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-foreground/80 flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-muted-foreground" /> {order.employeeEmail}
                                    </div>
                                    <p className="text-sm">
                                        <span className="font-semibold text-muted-foreground mr-1">📦 Claimed Products:</span>
                                        {order.selectedProducts?.map((p: any) => p.title).join(", ") || "None"}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="italic truncate">{order.address}</span>
                                    </p>
                                    {order.notes && (
                                        <p className="text-xs text-muted-foreground/95 bg-muted/40 p-3 rounded-xl border border-dashed mt-2 flex items-start gap-1.5">
                                            <Notebook className="w-3.5 h-3.5 mt-0.5 text-primary" />
                                            <span>Remark: "{order.notes}"</span>
                                        </p>
                                    )}
                                    <div className="text-[11px] text-muted-foreground pt-1 flex flex-wrap gap-x-4 gap-y-1 items-center">
                                        <span>HR Assigned: <strong className="text-foreground">{order.hrId?.name || "System/Admin"}</strong></span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Claimed: <strong>{new Date(order.createdAt).toLocaleString()}</strong></span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-fit shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                                    {order.status === 'Pending' && (
                                        <Button
                                            size="sm"
                                            className="w-full lg:w-36 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-1.5"
                                            onClick={() => updateStatus(order._id, 'Approved')}
                                        >
                                            <Check className="w-4 h-4" /> Approve Claim
                                        </Button>
                                    )}
                                    {order.status === 'Approved' && (
                                        <Button
                                            size="sm"
                                            className="w-full lg:w-36 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl gap-1.5"
                                            onClick={() => updateStatus(order._id, 'Shipped')}
                                        >
                                            <Package className="w-4 h-4" /> Ship Order
                                        </Button>
                                    )}
                                    {order.status !== 'Rejected' && order.status !== 'Cancelled' && order.status !== 'Shipped' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full lg:w-36 hover:bg-destructive/10 hover:text-destructive hover:border-destructive rounded-xl"
                                            onClick={() => updateStatus(order._id, 'Rejected')}
                                        >
                                            Reject Claim
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
