"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isDashboard =
        pathname?.startsWith("/admin-dashboard") ||
        pathname?.startsWith("/employer-dashboard") ||
        pathname?.startsWith("/user-dashboard");

    return (
        <div className={cn("h-full min-h-screen transition-colors duration-300", !isDashboard && "pt-16")}>
            {children}
        </div>
    );
}
