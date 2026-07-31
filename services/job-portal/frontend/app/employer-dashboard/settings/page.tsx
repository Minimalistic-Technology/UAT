"use client";

import React from "react";
import { Settings as SettingsIcon, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <SettingsIcon className="h-6 w-6 text-[#2563eb]" />
          Company & Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your employer preferences, notifications, and integrations.
        </p>
      </div>

      <Card className="flex h-64 items-center justify-center rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-0 text-slate-400">
          <Wrench className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <div className="text-center">
            <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
              Coming Soon
            </h2>
            <p className="text-sm font-medium">
              This module is under construction.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
