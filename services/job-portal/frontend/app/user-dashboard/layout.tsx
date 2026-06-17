"use client";

import UserSidebar from "@/features/user/components/user-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <div className="bg-background flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <UserSidebar className="fixed top-0 bottom-0 left-0 z-40 hidden min-h-screen transition-all duration-300 lg:flex" />

      <main
        className={cn(
          "bg-background/50 relative flex flex-1 flex-col transition-all duration-300",
          isCollapsed ? "lg:pl-[80px]" : "lg:pl-64",
        )}
      >
        <MobileSidebarHeader SidebarComponent={UserSidebar} />

        {/* Page Content */}
        <div className="flex-1 px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
