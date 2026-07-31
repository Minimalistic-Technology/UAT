import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusCardVariants = cva(
  "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 rounded-xl border border-secondary/20",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        admin: "bg-card text-card-foreground",
        success: "bg-card text-card-foreground border-success/30",
        warning: "bg-card text-card-foreground border-premium/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface StatusCardProps extends VariantProps<typeof statusCardVariants> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function AdminStatusCard({
  label,
  value,
  icon,
  description,
  variant,
  className,
}: StatusCardProps) {
  const isDefault = variant === "default";

  return (
    <Card className={cn(statusCardVariants({ variant }), className)}>
      <CardContent className="flex h-full flex-col justify-between gap-3 p-4 sm:p-5">
        <div className="flex w-full items-start justify-between">
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center rounded-md p-2",
                variant === "success"
                  ? "bg-success/10 text-success"
                  : variant === "warning"
                    ? "bg-premium/10 text-premium"
                    : "bg-primary/10 text-primary",
              )}
            >
              {React.cloneElement(
                icon as React.ReactElement<{
                  size?: number;
                  strokeWidth?: number;
                }>,
                {
                  size: 18,
                  strokeWidth: 2.5,
                },
              )}
            </div>
          )}
          {description && (
            <div
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap",
                variant === "success"
                  ? "bg-success/10 text-success"
                  : variant === "warning"
                    ? "bg-premium/10 text-premium"
                    : "bg-secondary/10 text-secondary",
              )}
            >
              {description}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-0.5">
          <span className="text-muted-foreground truncate text-xs font-medium sm:text-[13px]">
            {label}
          </span>
          <span className="font-heading text-foreground truncate text-xl font-bold tracking-tight sm:text-2xl">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
