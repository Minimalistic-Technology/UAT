"use client";

import React from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { IndianRupee, Users, Briefcase, ShieldCheck, Building, FileText, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import { getAnalyticsStatusCardsConfig } from "@/features/admin/config/admin-analytics.config";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  users: {
    label: "Users",
    color: "var(--chart-2)",
  },
  jobs: {
    label: "Jobs",
    color: "var(--chart-3)",
  },
  internships: {
    label: "Internships",
    color: "var(--chart-4)",
  },
};

const AnalyticsPage = () => {
  const { data: responseData, isLoading, error } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !responseData?.success) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-destructive font-semibold">
        Failed to load advanced analytics. Please refresh.
      </div>
    );
  }

  const { summary, graphs } = responseData.data;

  // Merge Jobs & Internships for a stacked/dual chart
  const mergedOpportunities = graphs.jobs.map((jobItem: any, index: number) => ({
    name: jobItem.name,
    jobs: jobItem.jobs,
    internships: graphs.internships[index]?.internships || 0,
  }));

  // Reusable custom Y-Axis formatter for currency
  const formatCurrency = (val: number) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`;

  // Export Analytics to CSV
  const handleExportReport = () => {
    const csvContent = [
      ["Platform Analytics Report", new Date().toLocaleString()],
      [],
      ["--- EXECUTIVE SUMMARY ---"],
      ["Metric", "Value"],
      ["Total Revenue (INR)", summary.totalRevenue],
      ["Revenue Growth (%)", summary.revenueGrowth],
      ["Active Users", summary.activeUsers],
      ["Job Listings", summary.jobListings],
      ["Internship Listings", summary.internshipListings],
      ["KYC Pending", summary.kycPending],
      ["Total Companies", summary.totalCompanies],
      ["Total Applications", summary.totalApplications],
      [],
      ["--- MONTHLY TRENDS (LAST 6 MONTHS) ---"],
      ["Month", "Revenue (INR)", "New Users", "New Jobs", "New Internships"],
      ...graphs.revenue.map((revItem: any, i: number) => [
        revItem.name,
        revItem.revenue,
        graphs.users[i]?.users || 0,
        graphs.jobs[i]?.jobs || 0,
        graphs.internships[i]?.internships || 0,
      ])
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Analytics_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Standard Header */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Advanced Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time multi-dimensional view of platform economics, user acquisition, and corporate engagement.
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <Button
            onClick={handleExportReport}
            variant="secondary"
            className="gap-2 cursor-pointer"
          >
            <Download className="size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ⚡ Primary KPIs Layer */}
      <div className="grid gap-6 md:grid-cols-2 text-foreground">
        <div className="group relative rounded-3xl border border-primary/20 bg-card p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-1">Gross Net Revenue</p>
              <h2 className="text-4xl font-black font-heading text-primary">
                ₹{summary.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h2>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary shadow-inner">
              <IndianRupee className="size-8" />
            </div>
          </div>
          <p className="text-sm font-semibold flex items-center gap-1 text-success">
            <span className="text-lg">↑</span> {summary.revenueGrowth >= 0 ? '+' : ''}{summary.revenueGrowth}% accelerated growth vs last month
          </p>
        </div>

        <div className="group relative rounded-3xl border border-secondary/20 bg-card p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-1">Total Active Directory</p>
              <h2 className="text-4xl font-black font-heading text-secondary">
                {summary.activeUsers.toLocaleString()}
              </h2>
            </div>
            <div className="rounded-xl bg-secondary/10 p-3 text-secondary shadow-inner">
              <Users className="size-8" />
            </div>
          </div>
          <p className="text-sm font-semibold flex items-center gap-1 text-muted-foreground">
            Platform population metrics are steadily climbing.
          </p>
        </div>
      </div>

      {/* 📊 Secondary KPIs Mesh */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {getAnalyticsStatusCardsConfig(summary).map((card, index) => (
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

      {/* 📈 Graphical Insights Engine */}
      <div className="grid gap-8 lg:grid-cols-2 mt-4">
        {/* Revenue Flow */}
        <div className="rounded-3xl border border-primary/10 bg-card p-6 shadow-lg shadow-primary/5 hover:shadow-xl transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-extrabold font-heading text-xl text-foreground">Revenue Flow</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">INR Output</span>
          </div>
          <ChartContainer config={{ revenue: chartConfig.revenue }} className="h-64 md:h-80 w-full">
            <AreaChart accessibilityLayer data={graphs.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.3} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} className="text-muted-foreground font-semibold" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={formatCurrency} className="text-muted-foreground font-medium" fontSize={11} />
              <ChartTooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltipContent hideLabel />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* User Acquisition */}
        <div className="rounded-3xl border border-secondary/10 bg-card p-6 shadow-lg shadow-secondary/5 hover:shadow-xl transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-extrabold font-heading text-xl text-foreground">User Acquisition</h3>
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase tracking-wider">Metrics</span>
          </div>
          <ChartContainer config={{ users: chartConfig.users }} className="h-64 md:h-80 w-full">
            <BarChart accessibilityLayer data={graphs.users} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.3} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} className="text-muted-foreground font-semibold" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} className="text-muted-foreground font-medium" fontSize={11} />
              <ChartTooltip cursor={{ fill: 'var(--secondary)', opacity: 0.1 }} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="users" fill="var(--secondary)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Opportunity Volume - Merged Jobs & Internships */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <div className="mb-8">
            <h3 className="font-extrabold font-heading text-2xl text-foreground">Opportunity Market Dynamics</h3>
            <p className="text-muted-foreground text-sm font-medium mt-1">Comparitive mapping between new Jobs and Internship listings over 6 months.</p>
          </div>
          <ChartContainer config={{ jobs: chartConfig.jobs, internships: chartConfig.internships }} className="h-72 sm:h-96 w-full">
            <AreaChart accessibilityLayer data={mergedOpportunities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} tickMargin={15} axisLine={false} className="text-muted-foreground font-semibold" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} className="text-muted-foreground font-medium" fontSize={12} />
              <ChartTooltip cursor={{ stroke: 'var(--foreground)', strokeWidth: 1, opacity: 0.2 }} content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="jobs" name="New Jobs" stroke="var(--chart-3)" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="internships" name="New Internships" stroke="var(--chart-4)" strokeWidth={3} fillOpacity={1} fill="url(#colorInt)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;