import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, UserCheck, CreditCard } from "lucide-react";

export function EmployerQuickStats() {
    return (
        <div className="space-y-4">
            <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Total Active Jobs</p>
                        <p className="text-[1.5rem] font-bold text-slate-800 dark:text-white leading-none">12</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-[14px] flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Applications Received</p>
                        <p className="text-[1.5rem] font-bold text-slate-800 dark:text-white leading-none">248</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-[14px] flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Current Plan</p>
                        <p className="text-[1.1rem] font-bold text-slate-800 dark:text-white leading-none mt-1">Premium</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-[14px] flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
