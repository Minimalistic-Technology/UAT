"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileSidebarHeader({
  SidebarComponent,
}: {
  SidebarComponent: React.ComponentType<{
    className?: string;
    forceExpanded?: boolean;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="bg-background sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 shadow-sm lg:hidden">
      <Logo />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground shrink-0"
          >
            <Menu className="h-6 w-6" strokeWidth={2.5} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="z-50 w-64 border-r bg-white p-0 sm:w-72 dark:bg-[#0A0F1C]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Navigate using the sidebar menu</SheetDescription>
          </SheetHeader>
          <SidebarComponent className="h-full w-full" forceExpanded />
        </SheetContent>
      </Sheet>
    </div>
  );
}
