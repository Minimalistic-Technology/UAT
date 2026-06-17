"use client";

import React from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import {
  IndianRupee,
  Users,
  Briefcase,
  ShieldCheck,
  Building,
  FileText,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import { getAnalyticsStatusCardsConfig } from "@/features/admin/config/admin-analytics.config";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error || !responseData?.success) {
    return (
      <div className="text-destructive flex h-[calc(100vh-100px)] items-center justify-center font-semibold">
        Failed to load advanced analytics. Please refresh.
      </div>
    );
  }

  const { summary, graphs } = responseData.data;

  // Merge Jobs & Internships for a stacked/dual chart
  const mergedOpportunities = graphs.jobs.map(
    (jobItem: any, index: number) => ({
      name: jobItem.name,
      jobs: jobItem.jobs,
      internships: graphs.internships[index]?.internships || 0,
    }),
  );

  // Reusable custom Y-Axis formatter for currency
  const formatCurrency = (val: number) =>
    `₹${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}`;

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
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Analytics_Export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Standard Header */}
      <div className="mb-6 flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">
            Advanced Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time multi-dimensional view of platform economics, user
            acquisition, and corporate engagement.
          </p>
        </div>
        <div className="mt-4 flex items-center md:mt-0">
          <Button
            onClick={handleExportReport}
            variant="secondary"
            className="cursor-pointer gap-2"
          >
            <Download className="size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ⚡ Primary KPIs Layer */}
      <div className="text-foreground grid gap-6 md:grid-cols-2">
        <div className="group border-primary/20 bg-card relative rounded-3xl border p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-bold tracking-wider uppercase">
                Gross Net Revenue
              </p>
              <h2 className="font-heading text-primary text-4xl font-black">
                ₹
                {summary.totalRevenue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h2>
            </div>
            <div className="bg-primary/10 text-primary rounded-xl p-3 shadow-inner">
              <IndianRupee className="size-8" />
            </div>
          </div>
          <p className="text-success flex items-center gap-1 text-sm font-semibold">
            <span className="text-lg">↑</span>{" "}
            {summary.revenueGrowth >= 0 ? "+" : ""}
            {summary.revenueGrowth}% accelerated growth vs last month
          </p>
        </div>

        <div className="group border-secondary/20 bg-card relative rounded-3xl border p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-bold tracking-wider uppercase">
                Total Active Directory
              </p>
              <h2 className="font-heading text-secondary text-4xl font-black">
                {summary.activeUsers.toLocaleString()}
              </h2>
            </div>
            <div className="bg-secondary/10 text-secondary rounded-xl p-3 shadow-inner">
              <Users className="size-8" />
            </div>
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-sm font-semibold">
            Platform population metrics are steadily climbing.
          </p>
        </div>
      </div>

      {/* 📊 Secondary KPIs Mesh */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
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
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {/* Revenue Flow */}
        <div className="border-primary/10 bg-card shadow-primary/5 rounded-3xl border p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-heading text-foreground text-xl font-extrabold">
              Revenue Flow
            </h3>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
              INR Output
            </span>
          </div>
          <ChartContainer
            config={{ revenue: chartConfig.revenue }}
            className="h-64 w-full md:h-80"
          >
            <AreaChart
              accessibilityLayer
              data={graphs.revenue}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-muted-foreground font-semibold"
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                className="text-muted-foreground font-medium"
                fontSize={11}
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--primary)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRev)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* User Acquisition */}
        <div className="border-secondary/10 bg-card shadow-secondary/5 rounded-3xl border p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-heading text-foreground text-xl font-extrabold">
              User Acquisition
            </h3>
            <span className="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
              Metrics
            </span>
          </div>
          <ChartContainer
            config={{ users: chartConfig.users }}
            className="h-64 w-full md:h-80"
          >
            <BarChart
              accessibilityLayer
              data={graphs.users}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-muted-foreground font-semibold"
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground font-medium"
                fontSize={11}
              />
              <ChartTooltip
                cursor={{ fill: "var(--secondary)", opacity: 0.1 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="users"
                fill="var(--secondary)"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Opportunity Volume - Merged Jobs & Internships */}
        <div className="border-border bg-card rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl lg:col-span-2">
          <div className="mb-8">
            <h3 className="font-heading text-foreground text-2xl font-extrabold">
              Opportunity Market Dynamics
            </h3>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Comparitive mapping between new Jobs and Internship listings over
              6 months.
            </p>
          </div>
          <ChartContainer
            config={{
              jobs: chartConfig.jobs,
              internships: chartConfig.internships,
            }}
            className="h-72 w-full sm:h-96"
          >
            <AreaChart
              accessibilityLayer
              data={mergedOpportunities}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-3)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-4)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-4)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                opacity={0.2}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={15}
                axisLine={false}
                className="text-muted-foreground font-semibold"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground font-medium"
                fontSize={12}
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--foreground)",
                  strokeWidth: 1,
                  opacity: 0.2,
                }}
                content={<ChartTooltipContent />}
              />
              <Area
                type="monotone"
                dataKey="jobs"
                name="New Jobs"
                stroke="var(--chart-3)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorJobs)"
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="internships"
                name="New Internships"
                stroke="var(--chart-4)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorInt)"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
