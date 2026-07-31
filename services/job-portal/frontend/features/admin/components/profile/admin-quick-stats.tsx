import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Building2, BriefcaseBusiness } from "lucide-react";

export function AdminQuickStats() {
  return (
    <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle className="text-[13px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          QUICK STATS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-blue-500" />
            <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">
              Total Revenue
            </span>
          </div>
          <span className="text-base font-bold text-slate-800 dark:text-white">
            12,482
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[#8b5cf6]" />
            <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">
              Total Companies
            </span>
          </div>
          <span className="text-base font-bold text-[#8b5cf6]">98%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-emerald-500" />
            <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">
              Active Listing
            </span>
          </div>
          <span className="text-base font-bold text-emerald-500">99.9%</span>
        </div>
      </CardContent>
    </Card>
  );
}
