"use client";

import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function SubscribersTab() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get('/admin/subscribers').then((res) => {
            if (!isMounted) return;
            setSubscribers(res.data.data || []);
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" /></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 sm:p-8 border-b border-theme-accent/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2"><Mail size={20} className="text-theme-action" />Newsletter Subscribers</h3>
                        <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Total Active Audience: {subscribers.length}</p>
                    </div>
                </div>
                <div className="p-6">
                    {subscribers.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-theme-accent/20 rounded-2xl">
                            <p className="text-foreground/50 font-semibold mb-2">No subscribers found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subscribers.map((sub: any) => (
                                <div key={sub.id} className="flex items-center gap-4 bg-background border border-theme-accent/10 p-4 rounded-xl shadow-sm hover:border-theme-action/30 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-theme-element-sec border border-theme-accent/20 flex items-center justify-center text-foreground font-black shrink-0 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-theme-action opacity-0 group-hover:opacity-10 transition-opacity" />
                                        {sub.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-foreground truncate">{sub.email}</p>
                                        <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-widest mt-1">Joined {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    <div className="shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
