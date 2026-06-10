import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

export function AdminSecurityCard() {
    return (
        <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 pt-6 px-8">
                <KeyRound className="w-5 h-5 text-[#8b5cf6]" />
                <CardTitle className="text-[17px] font-semibold text-slate-800 dark:text-white">
                    Security & Authentication
                </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-blue-100/80 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                            <KeyRound className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Change Password</h4>
                            <p className="text-[13px] text-slate-500">Last changed 45 days ago.</p>
                        </div>
                    </div>
                    <Link href="/forgot-password" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto h-10 px-6 rounded-xl border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold bg-white dark:bg-transparent shadow-sm"
                        >
                            Update
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
