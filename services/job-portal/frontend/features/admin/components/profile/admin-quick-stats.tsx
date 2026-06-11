import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Building2, BriefcaseBusiness } from "lucide-react";

export function AdminQuickStats() {
    return (
        <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-3 pt-6 px-6">
                <CardTitle className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    QUICK STATS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-blue-500" />
                        <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">Total Revenue</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-base">12,482</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#8b5cf6]" />
                        <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">Total Companies</span>
                    </div>
                    <span className="font-bold text-[#8b5cf6] text-base">98%</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <BriefcaseBusiness className="w-5 h-5 text-emerald-500" />
                        <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">Active Listing</span>
                    </div>
                    <span className="font-bold text-emerald-500 text-base">99.9%</span>
                </div>
            </CardContent>
        </Card>
    );
}
