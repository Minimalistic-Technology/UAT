"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminStatusCard as StatusCard } from "@/features/admin/components/stats-card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, Users, Briefcase, ShieldCheck, Loader2, Building2, Bell, MoreVertical } from "lucide-react";
import { GlobalSearch } from "@/features/admin/components/global-search";
import Link from "next/link";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  users: {
    label: "Users",
    color: "var(--secondary)",
  },
};

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

  const formatYAxis = (value: number) => {
    if (activeChart === "revenue") {
      if (value === 0) return "₹0";
      return `₹${value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-md min-w-[120px]">
          <p className="font-bold text-foreground mb-2 text-sm">{label}</p>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-[3px]" style={{ backgroundColor: payload[0].fill }} />
            <p className="text-sm font-semibold text-muted-foreground">
              {activeChart === "revenue"
                ? `₹${payload[0].value.toLocaleString("en-IN")}`
                : `${payload[0].value} Users`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Overview
        </h1>
        <div className="flex flex-1 items-center justify-end gap-4">
          <GlobalSearch />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full size-10 bg-muted/40 hidden sm:flex text-muted-foreground hover:text-foreground relative">
                {hasNotifications && <div className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full animate-pulse z-10" />}
                <Bell className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] bg-white dark:bg-slate-900 border-border z-50">
              <DropdownMenuLabel className="font-bold text-base">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex flex-col gap-1 p-1 max-h-64 overflow-y-auto">
                {summary.kycPending > 0 ? (
                  <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer" asChild>
                    <Link href="/admin-dashboard/kyc">
                      <span className="font-semibold text-sm text-premium">Verification Pending</span>
                      <span className="text-xs text-muted-foreground">{summary.kycPending} new companies require KYC approval.</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}

                {recentEmployers && recentEmployers.length > 0 && (
                  <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                    <span className="font-semibold text-sm text-primary">Recent Registrations</span>
                    <span className="text-xs text-muted-foreground">{recentEmployers[0].name} just registered recently.</span>
                  </DropdownMenuItem>
                )}

                {!hasNotifications && (
                  <span className="text-sm p-4 text-muted-foreground text-center">No new notifications.</span>
                )}
              </div>
              <DropdownMenuSeparator />
              <Button variant="ghost" size="sm" asChild className="w-full h-8 text-xs text-primary font-bold">
                <Link href="/admin-dashboard/users">View Activity Log</Link>
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="rounded-full h-10 px-4 font-semibold text-xs border-primary/20 hover:bg-primary/5 text-primary">
              <Link href="/admin-dashboard/coupons/create">Create Coupon</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-sm h-10 px-5 text-sm"
              asChild
            >
              <Link href="/admin-dashboard/plans/create">
                Create Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-success/30 bg-success/5 p-4 sm:p-5 shadow-sm">
        <div className="rounded-full bg-success/20 p-2 text-success flex-shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">System Health: All Systems Operational</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Last checked 2 minutes ago. All global nodes are performing at optimal capacity.</p>
        </div>
        <Button variant="link" className="ml-auto text-primary px-0 text-sm hidden sm:flex font-semibold hover:no-underline">
          View Status Page <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-70"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatusCard
          label="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          variant="default"
          icon={<IndianRupee />}
          className="border-primary/30"
          description={`${summary.revenueGrowth >= 0 ? '+' : ''}${summary.revenueGrowth}%`}
        />
        <StatusCard
          label="Subscriptions"
          value={summary.activeUsers.toLocaleString()}
          variant="default"
          icon={<Users />}
          className="border-secondary/30"
          description="+50 new"
        />
        <StatusCard
          label="Pending KYC"
          value={summary.kycPending.toLocaleString()}
          variant="warning"
          icon={<ShieldCheck />}
          className="border-premium/30"
          description="High Priority"
        />
        <StatusCard
          label="Job Listings"
          value={summary.jobListings.toLocaleString()}
          variant="default"
          icon={<Briefcase />}
          className="border-primary/20"
        />
        <StatusCard
          label="Companies Registered"
          value={summary.totalCompanies.toLocaleString()}
          variant="default"
          icon={<Building2 />}
          className="border-primary/20"
        />
        <StatusCard
          label="Internship Listings"
          value={summary.internshipListings.toLocaleString()}
          variant="default"
          icon={<Briefcase />}
          className="border-primary/20"
        />
      </div>

      <div className="grid gap-6 mb-8 lg:grid-cols-3">
        <div className="min-h-100 rounded-2xl border border-secondary/20 bg-card p-6 shadow-sm lg:col-span-3">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold font-heading text-foreground">
                {activeChart === "revenue" ? "Revenue Growth" : "User Acquisition"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeChart === "revenue" ? "Monthly Recurring Revenue (MRR) Trends" : "New User Registrations Over Time"}
              </p>
            </div>
            <div className="flex bg-muted/40 p-1 rounded-md">
              <Button
                onClick={() => setActiveChart("revenue")}
                variant="ghost"
                size="sm"
                className={cn("h-8 px-4 text-xs font-semibold overflow-hidden transition-all duration-300", activeChart === "revenue" ? "bg-white shadow-xs border border-border text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Revenue
              </Button>
              <Button
                onClick={() => setActiveChart("users")}
                variant="ghost"
                size="sm"
                className={cn("h-8 px-4 text-xs font-semibold overflow-hidden transition-all duration-300", activeChart === "users" ? "bg-white shadow-xs border border-border text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Users
              </Button>
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-56 w-full md:h-72 mt-4">
            <BarChart accessibilityLayer data={graphs[activeChart]} margin={{ left: -15, right: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatYAxis}
                fontSize={12}
                className="text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey={activeChart}
                fill={`var(--color-${activeChart})`}
                radius={[6, 6, 0, 0]}
                barSize={40}
                className="transition-colors duration-500 ease-in-out"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-secondary/20 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-heading text-foreground">Recent Employer<br />Registrations</h3>
            <Button variant="link" className="text-primary font-semibold">View All</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase text-muted-foreground tracking-wider font-semibold">
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 px-4 font-semibold">Applied On</th>
                  <th className="pb-3 px-4 font-semibold">Kyc Status</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployers && recentEmployers.length > 0 ? recentEmployers.map((employer: any) => {
                  const companyInitials = employer.name ? employer.name.charAt(0).toUpperCase() : "C";
                  let statusLabel = "VERIFIED";
                  let displayCol = "bg-green-100 text-green-700";

                  if (!employer.isVerified || employer.kycStatus === 'pending') {
                    statusLabel = "PENDING";
                    displayCol = "bg-amber-100 text-amber-700";
                  } else if (employer.kycStatus === 'rejected') {
                    statusLabel = "ACTION REQUIRED";
                    displayCol = "bg-red-100 text-red-700";
                  }

                  return (
                    <tr key={employer._id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs bg-primary/10 text-primary`}>
                            {companyInitials}
                          </div>
                          <span className="font-semibold text-foreground max-w-[130px] truncate">{employer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{new Date(employer.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${displayCol}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No recent employers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary/20 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-heading text-foreground">Top Performing<br />Coupons</h3>
            <Button variant="secondary" asChild className="bg-primary/5 hover:bg-primary/10 text-primary font-semibold hidden sm:flex">
              <Link href="/admin-dashboard/coupons/create">
                + New Coupon
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {topCoupons && topCoupons.length > 0 ? topCoupons.map((coupon: any) => (
              <div key={coupon._id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-2 rounded-lg font-bold text-sm bg-primary/10 text-primary`}>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{coupon.code}</span>
                    <span className="text-xs text-muted-foreground">{coupon.isActive ? "Active" : "Expired"} · {coupon.usageCount} total uses</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary">{coupon.maxUses === -1 ? 'Unlimited' : `${coupon.maxUses} Limit`}</span>
                  <span className={`text-[10px] font-bold tracking-wider uppercase text-success`}>TOP USED</span>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-muted-foreground text-sm">No active coupons found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
