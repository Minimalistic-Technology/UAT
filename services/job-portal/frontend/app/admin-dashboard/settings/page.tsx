"use client";

import React from "react";
import { Settings as SettingsIcon, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <SettingsIcon className="w-6 h-6 text-[#2563eb]" />
                    System Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Configure platform-wide variables and future integrations.</p>
            </div>

            <Card className="shadow-sm rounded-[20px] bg-white border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] h-64 flex items-center justify-center">
                <CardContent className="flex flex-col items-center gap-4 text-slate-400 p-0">
                    <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Coming Soon</h2>
                        <p className="text-sm font-medium">This module is under construction.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
