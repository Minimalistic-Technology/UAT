"use client";

import { useState } from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { Loader2 } from "lucide-react";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";

import { AdminDashboardHeader } from "@/features/admin/components/dashboard/admin-dashboard-header";
import { AdminDashboardCharts } from "@/features/admin/components/dashboard/admin-dashboard-charts";
import { AdminRecentEmployers } from "@/features/admin/components/dashboard/admin-recent-employers";
import { AdminTopCoupons } from "@/features/admin/components/dashboard/admin-top-coupons";
import { getStatusCardsConfig } from "@/features/admin/config/admin-dashboard.config";

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminAnalytics();
  const [activeChart, setActiveChart] = useState<"revenue" | "users">(
    "revenue",
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="flex h-96 items-center justify-center text-red-500">
        Failed to load analytics data.
      </div>
    );
  }

  const { summary, graphs, recentEmployers, topCoupons } = data.data;
  const hasNotifications =
    summary.kycPending > 0 || (recentEmployers && recentEmployers.length > 0);

  return (
    <>
      <AdminDashboardHeader
        hasNotifications={hasNotifications}
        summary={summary}
        recentEmployers={recentEmployers}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {getStatusCardsConfig(summary).map((card, index) => (
          <StatusCard
            key={index}
            label={card.label}
            value={card.value}
            variant={card.variant}
            icon={card.icon}
            className={card.className}
          />
        ))}
      </div>

      <AdminDashboardCharts
        activeChart={activeChart}
        setActiveChart={setActiveChart}
        graphData={graphs[activeChart]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminRecentEmployers employers={recentEmployers} />
        <AdminTopCoupons coupons={topCoupons} />
      </div>
    </>
  );
};

export default AdminDashboard;
