import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  }
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
  const isDefault = variant === 'default';

  return (
    <Card className={cn(statusCardVariants({ variant }), className)}>
      <CardContent className="p-4 sm:p-5 flex flex-col gap-3 h-full justify-between">
        <div className="flex items-start justify-between w-full">
          {icon && (
            <div className={cn(
              "p-2 rounded-md flex flex-shrink-0 items-center justify-center",
              variant === 'success' ? "bg-success/10 text-success" :
                variant === 'warning' ? "bg-premium/10 text-premium" :
                  "bg-primary/10 text-primary"
            )}>
              {/* @ts-ignore */}
              {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 2.5 })}
            </div>
          )}
          {description && (
            <div className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
              variant === 'success' ? "bg-success/10 text-success" :
                variant === 'warning' ? "bg-premium/10 text-premium" :
                  "bg-secondary/10 text-secondary"
            )}>
              {description}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-0.5">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground truncate">
            {label}
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-foreground truncate">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}