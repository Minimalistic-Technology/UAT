import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#2563eb",
  },
  users: {
    label: "Users",
    color: "#8b5cf6",
  },
};

interface AdminDashboardChartsProps {
  activeChart: "revenue" | "users";
  setActiveChart: (chart: "revenue" | "users") => void;
  graphData: any[];
}

export function AdminDashboardCharts({
  activeChart,
  setActiveChart,
  graphData,
}: AdminDashboardChartsProps) {
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
        <div className="min-w-[120px] rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-[3px]"
              style={{ backgroundColor: payload[0].fill }}
            />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
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
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      <div className="min-h-fit min-w-0 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_2px_15px_rgba(0,0,0,0.04)] sm:p-6 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
        {/* Header — stacks on mobile, row on sm+ */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
              {activeChart === "revenue"
                ? "Revenue Growth"
                : "User Acquisition"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {activeChart === "revenue"
                ? "Monthly Recurring Revenue (MRR) Trends"
                : "New User Registrations Over Time"}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex w-fit rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <Button
              onClick={() => setActiveChart("revenue")}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-300 sm:px-4",
                activeChart === "revenue"
                  ? "border border-slate-200 bg-white text-[#2563eb] shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              Revenue
            </Button>
            <Button
              onClick={() => setActiveChart("users")}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-300 sm:px-4",
                activeChart === "users"
                  ? "border border-slate-200 bg-white text-[#2563eb] shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              Users
            </Button>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="h-48 w-full sm:h-56 md:h-72"
        >
          <BarChart
            accessibilityLayer
            data={graphData}
            margin={{ left: -10, right: 5 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.4}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={11}
              className="text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={5}
              tickFormatter={formatYAxis}
              fontSize={11}
              className="text-slate-500"
              width={48}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={40} // ← fluid, not fixed
              className="transition-colors duration-500 ease-in-out"
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
