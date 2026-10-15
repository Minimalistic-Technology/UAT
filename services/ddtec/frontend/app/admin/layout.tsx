"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading, isLoggingOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push(isLoggingOut ? "/login" : `/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (user.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, authLoading, router, pathname, isLoggingOut]);

    if (authLoading || !user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="size-10 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar
                collapsed={isSidebarCollapsed}
                onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className={`flex-1 min-w-0 p-8 pt-24 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {children}
            </main>
        </div>
    );
}
