"use client";

import Container from "@/components/container";
import EmployerSidebar from "@/features/employer/components/employer-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Logo from "@/components/logo";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Desktop Sidebar */}
      <EmployerSidebar className="fixed left-0 top-0 bottom-0 min-h-screen w-64 hidden lg:flex z-40" />

      <main className="flex-1 lg:pl-64 flex flex-col bg-background/50 relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-background sticky top-0 z-30 shadow-sm">
          <Logo />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-foreground">
                <Menu className="h-6 w-6" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 sm:w-72 border-r z-50">
              <EmployerSidebar className="h-full w-full min-h-screen" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Content */}
        <div className="flex-1 px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
