"use client";

import React from "react";
import ScheduleMailView from "../components/ScheduleMailView";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ScheduleMailPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Admin Dashboard
                    </Link>
                </div>
                <ScheduleMailView />
            </div>
        </div>
    );
}
