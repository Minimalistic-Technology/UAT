"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Gift, FileText, CheckCircle, LogOut, Briefcase } from "lucide-react";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { href: "/hr/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/hr/tasks", label: "HR Tasks (Placeholder)", icon: FileText },
];

export default function HRAdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated) {
            router.replace("/login");
        } else if (user?.role !== "HRAdmin" && user?.role !== "Admin") {
            router.replace("/profile");
        }
    }, [isAuthenticated, user?.role, router, mounted]);

    if (!mounted) return null;
    if (!isAuthenticated || (user?.role !== "HRAdmin" && user?.role !== "Admin")) return null;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <Sidebar className="border-r border-border">
                    <SidebarHeader className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg">{APP_NAME} <span className="text-xs text-violet-500 font-semibold">HR</span></span>
                        </div>
                    </SidebarHeader>

                    <Separator />

                    <SidebarContent className="p-2 mt-2">
                        <SidebarMenu>
                            {navItems.map(({ href, label, icon: Icon }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton
                                        render={<Link href={href} />}
                                        isActive={pathname === href}
                                        className="rounded-xl"
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="p-4 space-y-3">
                        <Separator />
                        <div className="flex items-center gap-3 py-2">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback className="bg-violet-500/10 text-violet-600 text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || "H"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.role === "Admin" ? "Super Admin" : "HR Admin"}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { logout(); router.push("/login"); }}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-destructive/10"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster richColors position="top-center" />
        </SidebarProvider>
    );
}
