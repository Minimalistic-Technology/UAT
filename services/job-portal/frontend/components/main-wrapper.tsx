"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { status } = useSession();

    const isLandingPage = pathname === "/";
    const isPublicFindJobs = pathname?.startsWith("/find-jobs") || pathname?.startsWith("/job/");
    const isProfilePage = pathname?.startsWith("/profile");

    return (
        <div className={cn("h-full min-h-screen transition-colors duration-300", (isLandingPage || isPublicFindJobs || isProfilePage) && "pt-[72px]")}>
            {children}
        </div>
    );
}
