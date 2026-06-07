"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isLandingPage = pathname === "/";

    return (
        <div className={cn("h-full min-h-screen transition-colors duration-300", isLandingPage && "pt-16")}>
            {children}
        </div>
    );
}
