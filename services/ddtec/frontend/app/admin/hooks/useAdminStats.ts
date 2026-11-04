"use client";

import { useState } from "react";
import api from "@/lib/api";

export interface DashboardStats {
    users: number;
    products: number;
    revenue: number;
    orders: number;
    deliveredStats?: {
        totalDeliveredCount: number;
        totalDeliveredRevenue: number;
        trends: Array<{
            date: string;
            label: string;
            day: string;
            count: number;
            revenue: number;
        }>;
        statusBreakdown: Record<string, { count: number; revenue: number }>;
    };
    recentActivity: Array<{
        _id: string;
        totalAmount: number;
        status: string;
        createdAt: string;
        shippingInfo: { fullName: string };
    }>;
}

export function useAdminStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    return { stats, loadingStats, fetchStats };
}
