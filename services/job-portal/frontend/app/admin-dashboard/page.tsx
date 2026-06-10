"use client";

import { useState } from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { IndianRupee, Users, Briefcase, ShieldCheck, Loader2, Building2 } from "lucide-react";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";

import { AdminDashboardHeader } from "@/features/admin/components/dashboard/admin-dashboard-header";
import { AdminDashboardCharts } from "@/features/admin/components/dashboard/admin-dashboard-charts";
import { AdminRecentEmployers } from "@/features/admin/components/dashboard/admin-recent-employers";
import { AdminTopCoupons } from "@/features/admin/components/dashboard/admin-top-coupons";

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminAnalytics();
  const [activeChart, setActiveChart] = useState<"revenue" | "users">("revenue");

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
  const hasNotifications = summary.kycPending > 0 || (recentEmployers && recentEmployers.length > 0);

  return (
    <>
      <AdminDashboardHeader
        hasNotifications={hasNotifications}
        summary={summary}
        recentEmployers={recentEmployers}
      />

      <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatusCard
          label="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          variant="default"
          icon={<IndianRupee />}
          className="border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
        <StatusCard
          label="Subscriptions"
          value={summary.activeUsers.toLocaleString()}
          variant="default"
          icon={<Users />}
          className="border-[#8b5cf6]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
        <StatusCard
          label="Pending KYC"
          value={summary.kycPending.toLocaleString()}
          variant="warning"
          icon={<ShieldCheck />}
          className="border-rose-500/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
        <StatusCard
          label="Job Listings"
          value={summary.jobListings.toLocaleString()}
          variant="default"
          icon={<Briefcase />}
          className="border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
        <StatusCard
          label="Companies"
          value={summary.totalCompanies.toLocaleString()}
          variant="default"
          icon={<Building2 />}
          className="border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
        <StatusCard
          label="Internships"
          value={summary.internshipListings.toLocaleString()}
          variant="default"
          icon={<Briefcase />}
          className="border-[#2563eb]/20 shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
        />
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
