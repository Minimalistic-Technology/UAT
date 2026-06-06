"use client";

import React from "react";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { IndianRupee, Users, Briefcase, ShieldCheck, Building, FileText, Loader2 } from "lucide-react";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* 🚀 Ultra-Premium Thin Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0F1C] p-6 lg:px-8 lg:py-6 border border-slate-800/60 shadow-xl">
        {/* Abstract Background Elements */}
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-transparent opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', mixBlendMode: 'overlay' }}></div>

        {/* Glowing Orbs */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-primary/40 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-32 -mb-24 -ml-24 h-64 w-64 rounded-full bg-secondary/30 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            {/* Title & Copy */}
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white mb-1">
              Advanced Intelligence
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-xs md:text-sm">
              Real-time multi-dimensional view of platform economics, user acquisition, and corporate engagement.
            </p>
          </div>

          {/* Contextual Actions */}
          <div className="flex items-center mt-2 md:mt-0 flex-shrink-0">
            <button
              onClick={handleExportReport}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-md border border-white/10 transition-all text-sm flex items-center gap-2 shadow-lg hover:shadow-white/5 active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              Export Report
            </button>
          </div>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <StatusCard label="Active Jobs" value={summary.jobListings.toLocaleString()} variant="default" icon={<Briefcase />} className="border-border hover:border-primary/40 transition-colors" />
        <StatusCard label="Internships" value={summary.internshipListings.toLocaleString()} variant="default" icon={<Briefcase />} className="border-border hover:border-secondary/40 transition-colors" />
        <StatusCard label="Companies" value={summary.totalCompanies.toLocaleString()} variant="default" icon={<Building />} className="border-border hover:border-primary/40 transition-colors" />
        <StatusCard label="Total Apps" value={summary.totalApplications.toLocaleString()} variant="default" icon={<FileText />} className="border-border hover:border-secondary/40 transition-colors" />
        <StatusCard label="KYC Tasks" value={summary.kycPending.toLocaleString()} variant="warning" icon={<ShieldCheck />} className="md:col-span-1 col-span-2 shadow-md border-premium/40 bg-premium/5" />
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