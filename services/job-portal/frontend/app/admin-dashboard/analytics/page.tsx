"use client";

import React from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { DollarSign, Users, Briefcase, ShieldCheck, Building, FileText, Loader2 } from "lucide-react";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  users: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
  jobs: {
    label: "Jobs",
    color: "hsl(var(--chart-3))",
  },
};

const AnalyticsPage = () => {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-red-500">
        Failed to load analytics data.
      </div>
    );
  }

  const { summary, graphs } = data.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Detailed Analytics</h1>
        <p className="text-sm text-slate-500">
          In-depth overview of your platform's performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatusCard
          label="Total Revenue"
          value={`$${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          variant="admin"
          icon={<DollarSign />}
          description={`${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth}% vs last month`}
          className="xl:col-span-2"
        />
        <StatusCard
          label="Active Users"
          value={summary.activeUsers.toLocaleString()}
          variant="admin"
          icon={<Users className="text-slate-400" />}
          className="bg-linear-to-tr from-blue-800 to-blue-600 xl:col-span-2"
        />
        <StatusCard
          label="Job Listings"
          value={summary.jobListings.toLocaleString()}
          variant="admin"
          icon={<Briefcase className="text-slate-400" />}
          className="xl:col-span-2"
        />
        <StatusCard
          label="KYC Pending"
          value={summary.kycPending.toLocaleString()}
          variant="admin"
          icon={<ShieldCheck className="text-slate-400" />}
        />
        <StatusCard
          label="Total Companies"
          value={summary.totalCompanies.toLocaleString()}
          variant="admin"
          icon={<Building className="text-slate-400" />}
        />
        <StatusCard
          label="Total Apps"
          value={summary.totalApplications.toLocaleString()}
          variant="admin"
          icon={<FileText className="text-slate-400" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Graph */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Revenue (Last 6 Months)</h3>
          <ChartContainer config={{ revenue: chartConfig.revenue }} className="h-72 w-full">
            <AreaChart accessibilityLayer data={graphs.revenue}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Area type="monotone" dataKey="revenue" fill="var(--color-revenue)" stroke="var(--color-revenue)" fillOpacity={0.3} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Users Graph */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">New Users (Last 6 Months)</h3>
          <ChartContainer config={{ users: chartConfig.users }} className="h-72 w-full">
            <BarChart accessibilityLayer data={graphs.users}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Jobs Graph */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-800">New Jobs (Last 6 Months)</h3>
          <ChartContainer config={{ jobs: chartConfig.jobs }} className="h-72 w-full">
            <LineChart accessibilityLayer data={graphs.jobs}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line type="monotone" dataKey="jobs" stroke="var(--color-jobs)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;