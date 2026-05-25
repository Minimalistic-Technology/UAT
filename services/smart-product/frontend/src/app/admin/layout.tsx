"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Link as LinkIcon, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/components/ui/Button';

const sidebarLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Share Links', href: '/admin/links', icon: LinkIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuthStore();

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <aside className="w-full md:w-64 glassmorphism border-r border-secondary/50 flex flex-col md:h-screen sticky top-0">
                <div className="p-6 border-b border-secondary/50">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">SmartShare</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        const Icon = link.icon;

                        return (
                            <Link key={link.name} href={link.href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                        isActive
                                            ? "text-primary font-medium bg-primary/10"
                                            : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-sidebar"
                                            className="absolute inset-0 bg-primary/10 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} className="relative z-10" />
                                    <span className="relative z-10">{link.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-secondary/50 space-y-2">
                    <div className="px-3 py-2 text-sm">
                        <p className="font-semibold text-foreground truncate">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen max-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
