"use client";

import React, { useEffect, useState } from 'react';
import { Package, Link as LinkIcon, Users, Activity } from 'lucide-react';
import api from '@/lib/axios';

const StatsCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{value}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
        </div>
        {trend && (
            <p className="text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">{trend}</span> from last month
            </p>
        )}
        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, links: 0, views: 0 });

    useEffect(() => {
        // In a real app we would fetch the dashboard aggregation
        // For now we just load basic info to mock stats if backend doesn't have an aggregation route yet.
        const fetchStats = async () => {
            try {
                const [productsRes, linksRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/share/analytics')
                ]);

                const productsCount = productsRes.data.length || 0;
                const linksCount = linksRes.data.links?.length || 0;
                const viewsCount = linksRes.data.links?.reduce((acc: number, link: any) => acc + link.totalViews, 0) || 0;

                setStats({ products: productsCount, links: linksCount, views: viewsCount });
            } catch (err) {
                console.error('Failed to load stats', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome to your SmartShare admin dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Products" value={stats.products} icon={Package} trend="+12%" />
                <StatsCard title="Active Links" value={stats.links} icon={LinkIcon} trend="+5%" />
                <StatsCard title="Total Views" value={stats.views} icon={Activity} trend="+18%" />
                <StatsCard title="Active Users" value="1" icon={Users} trend="Constant" />
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 h-96 flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics Chart Placeholder</p>
                </div>
                <div className="glass-card p-6 h-96 flex items-center justify-center">
                    <p className="text-muted-foreground">Recent Activity Placeholder</p>
                </div>
            </div>
        </div>
    );
}
