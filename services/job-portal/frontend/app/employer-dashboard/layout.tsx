"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { MobileSidebarHeader } from "@/components/mobile-sidebar-header";
import { DashboardContainer } from "@/components/dashboard-container";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background/50 relative flex min-w-0 flex-1 flex-col transition-all duration-300">
        <MobileSidebarHeader SidebarComponent={AppSidebar} />

        {/* Page Content */}
        <DashboardContainer>{children}</DashboardContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
