"use client";

import UserSidebar from "@/features/user/components/user-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Logo from "@/components/logo";
import { useSidebar } from "@/components/ui/sidebar-context";
import { cn } from "@/lib/utils";
import { MobileSidebarHeader } from "@/components/mobile-sidebar-header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Desktop Sidebar */}
      <UserSidebar className="fixed left-0 top-0 bottom-0 min-h-screen hidden lg:flex z-40 transition-all duration-300" />

      <main className={cn("flex-1 flex flex-col bg-background/50 relative transition-all duration-300", isCollapsed ? "lg:pl-[80px]" : "lg:pl-64")}>
        <MobileSidebarHeader SidebarComponent={UserSidebar} />

        {/* Page Content */}
        <div className="flex-1 px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
