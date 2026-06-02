"use client";

import { AdminStatusCard as StatusCard  } from "@/features/admin/components/stats-card";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus, Users, Briefcase, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

const AdminDashboard = () => {
  const { data, isLoading, error } = useAdminAnalytics();

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

  const { summary, graphs } = data.data;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, Raj. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin-dashboard/coupons/create">Create Coupon</Link>
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-600/80"
            asChild
          >
            <Link href="/admin-dashboard/plans/create">
              <Plus className="mr-2 size-4" /> Create Plan
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Total Revenue"
          value={`Rs ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          variant="admin"
          description={`${summary.revenueCurrency} ${summary.revenueGrowth >= 0 ? '+' : ''} ${summary.revenueGrowth}% vs last month`}
        />
        <StatusCard
          label="Active Users"
          value={summary.activeUsers.toLocaleString()}
          variant="admin"
          icon={<Users className="text-slate-400" />}
          className="bg-linear-to-tr from-blue-800 to-blue-600"
        />
        <StatusCard
          label="Job Listings"
          value={summary.jobListings.toLocaleString()}
          variant="admin"
          icon={<Briefcase className="text-slate-400" />}
        />
        <StatusCard
          label="KYC Pending"
          value={summary.kycPending.toLocaleString()}
          variant="admin"
          icon={<ShieldCheck className="text-slate-400" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-h-100 rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin-dashboard/analytics">View All Analytics</Link>
            </Button>
          </div>
          
          <ChartContainer config={chartConfig} className="h-48 w-full md:h-64">
            <BarChart accessibilityLayer data={graphs.revenue}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
