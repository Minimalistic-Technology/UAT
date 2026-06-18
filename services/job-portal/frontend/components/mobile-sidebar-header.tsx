"use client";

import React from "react";
import Logo from "@/components/logo";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileSidebarHeader({
  SidebarComponent,
}: {
  SidebarComponent?: React.ComponentType<any>;
}) {
  return (
    <div className="bg-background sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 shadow-sm lg:hidden">
      <Logo />
      <SidebarTrigger className="text-foreground shrink-0" />
    </div>
  );
}
