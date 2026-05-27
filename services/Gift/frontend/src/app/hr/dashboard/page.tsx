"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, Users, FileText, CheckCircle2, Clock } from "lucide-react";

export default function HRDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { title: "Total Managed Staff", value: "24", desc: "Employees active in directory", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Gifts Allocated", value: "18", desc: "Successfully assigned", icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
        { title: "Tasks Completed", value: "12", desc: "This week's target actions", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                    <Briefcase className="w-8 h-8 text-violet-600" /> HR Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here is your department's analytics overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <Card key={s.title} className="hover:shadow-md transition-shadow border rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold">{s.title}</CardTitle>
                            <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-violet-500" /> Department Logs
                        </CardTitle>
                        <CardDescription>Recent actions performed by HR accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <div className="text-xs">
                                <span className="font-bold">You</span> assigned catalog gifts collection to <span className="font-medium text-foreground">Rajesh Kumar</span>
                                <p className="text-muted-foreground text-[10px] mt-0.5">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                            <div className="text-xs">
                                <span className="font-bold">You</span> logged in from IP 192.168.1.4
                                <p className="text-muted-foreground text-[10px] mt-0.5">Yesterday at 4:12 PM</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl bg-gradient-to-br from-violet-600/5 to-primary/5 border-violet-500/25">
                    <CardHeader>
                        <CardTitle>HR Admin Features</CardTitle>
                        <CardDescription>Custom department controls will be populated here based on requirements.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 prose prose-sm text-muted-foreground text-xs leading-relaxed">
                        <p>
                            This panel is restricted to users with the <span className="font-bold text-violet-600">HRAdmin</span> role. Your configuration has been created and registered on the server.
                        </p>
                        <p>
                            Administrators can easily assign or revoke this role via the <span className="font-semibold text-foreground">Manage Users</span> tab of the Super Admin Panel.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
