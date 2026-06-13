import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserWelcomeHeaderProps {
    userName: string;
    totalApplied: number;
}

export function UserWelcomeHeader({ userName, totalApplied }: UserWelcomeHeaderProps) {
    return (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">
                    Welcome back, {userName}!
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                    You have applied to{" "}
                    <span className="font-bold text-[#2563eb]">
                        {totalApplied} jobs
                    </span>{" "}
                    so far.
                </p>
            </div>
            <Button asChild className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-primary/20">
                <Link href="/find-jobs">
                    <Search className="mr-2 h-4 w-4" /> Browse Jobs
                </Link>
            </Button>
        </div>
    );
}
