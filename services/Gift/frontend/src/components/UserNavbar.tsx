"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Gift, LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

export default function UserNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    // Prevent hydration differences
    const isLoggedIn = mounted && isAuthenticated && user;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Services", href: "/services" },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Gift className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{APP_NAME}</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full select-none cursor-pointer border border-border/40 p-0 hover:bg-muted/40 flex items-center justify-center outline-none">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold animate-pulse-once">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-1 p-2 bg-card border rounded-xl shadow-lg">
                                <div className="px-2.5 py-1.5 flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <User className="h-4 w-4" />
                                    <span>My Profile</span>
                                </DropdownMenuItem>
                                {user.role === "Admin" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="cursor-pointer gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-primary font-medium">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Admin Console</span>
                                    </DropdownMenuItem>
                                )}
                                {(user.role === "HRAdmin" || user.role === "Admin") && (
                                    <DropdownMenuItem onClick={() => router.push("/hr/dashboard")} className="cursor-pointer gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-violet-500 font-medium">
                                        <LayoutDashboard className="h-4 w-4 text-violet-500" />
                                        <span>HR Console</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="shadow-sm shadow-primary/20">Get Started Free</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-md px-6 py-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                    <nav className="flex flex-col gap-3">
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-sm font-medium transition-colors hover:text-primary py-1.5 ${active ? "text-primary font-bold" : "text-muted-foreground"}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-border/80 pt-4 flex flex-col gap-2">
                        {isLoggedIn ? (
                            <>
                                <div className="px-1.5 pb-2">
                                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setMobileMenuOpen(false); router.push("/profile"); }}
                                    className="w-full gap-2 justify-start"
                                >
                                    <User className="w-4 h-4" /> My Profile
                                </Button>
                                {user.role === "Admin" && (
                                    <Button
                                        variant="outline"
                                        onClick={() => { setMobileMenuOpen(false); router.push("/admin/dashboard"); }}
                                        className="w-full gap-2 justify-start text-primary"
                                    >
                                        <LayoutDashboard className="w-4 h-4" /> Admin Console
                                    </Button>
                                )}
                                {(user.role === "HRAdmin" || user.role === "Admin") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => { setMobileMenuOpen(false); router.push("/hr/dashboard"); }}
                                        className="w-full gap-2 justify-start text-violet-500"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-violet-500" /> HR Console
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                                    className="w-full gap-2 justify-start"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                    <Button className="w-full shadow-sm shadow-primary/20">Get Started Free</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
