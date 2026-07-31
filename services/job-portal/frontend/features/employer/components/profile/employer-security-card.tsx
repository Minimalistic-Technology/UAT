import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, ShieldAlert } from "lucide-react";

export function EmployerSecurityCard() {
  return (
    <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-8 pt-6 pb-4">
        <KeyRound className="h-5 w-5 text-blue-500" />
        <CardTitle className="text-[17px] font-semibold text-slate-800 dark:text-white">
          Security & Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-100/80 dark:bg-blue-900/40">
              <KeyRound className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                Change Password
              </h4>
              <p className="text-[13px] text-slate-500">
                Regularly changing your password improves security.
              </p>
            </div>
          </div>
          <Link href="/forgot-password" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-blue-200 bg-white px-6 font-semibold text-blue-600 shadow-sm hover:bg-blue-50 sm:w-auto dark:border-blue-800 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              Update
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
