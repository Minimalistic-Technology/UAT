"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { status } = useSession();

    const isLandingPage = pathname === "/";
    const isPublicFindJobs = pathname?.startsWith("/find-jobs") || pathname?.startsWith("/job/") || pathname?.startsWith("/internship/");
    const isProfilePage = pathname?.startsWith("/profile");
    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/employer-register";

    return (
        <div className={cn("h-full min-h-screen transition-colors duration-300", (isLandingPage || isPublicFindJobs || isProfilePage || isAuthPage) && "pt-[72px]")}>
            {children}
        </div>
    );
}
