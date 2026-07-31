import React from "react";
import { cn } from "@/lib/utils";

interface DashboardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DashboardContainer({
  children,
  className,
  ...props
}: DashboardContainerProps) {
  return (
    <div
      className={cn(
        "w-full flex-1",
        // Responsive padding for small mobile, medium mobile, tablet, and laptop
        "px-4 py-6", // Base (Small/Medium Mobile)
        "sm:px-6 sm:py-8", // Small Tablets / Large Mobile
        "md:px-8 md:py-8", // Tablets
        "lg:px-10 lg:py-10", // Laptops / Desktops
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1600px]">{children}</div>
    </div>
  );
}
