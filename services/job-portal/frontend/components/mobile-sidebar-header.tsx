"use client";

import React from "react";
import Logo from "@/components/logo";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileSidebarHeader({
    SidebarComponent
}: {
    SidebarComponent: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background sticky top-0 z-30 shadow-sm">
            <Logo />
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-foreground">
                        <Menu className="h-6 w-6" strokeWidth={2.5} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 sm:w-72 border-r z-50 bg-white dark:bg-[#0A0F1C]">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>Navigate using the sidebar menu</SheetDescription>
                    </SheetHeader>
                    <SidebarComponent className="h-full w-full min-h-screen" />
                </SheetContent>
            </Sheet>
        </div>
    );
}
