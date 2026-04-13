import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statusCardVariants = cva(
  "relative overflow-hidden transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",
        admin: "bg-slate-900 text-slate-50 border-none shadow-lg dark:bg-slate-950",
        success: "bg-emerald-600 text-white border-none shadow-lg",
        warning: "bg-amber-500 text-white border-none shadow-lg",
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
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className={cn(
              "text-sm font-medium uppercase tracking-wider",
              isDefault ? "text-muted-foreground" : "text-white/70"
            )}>
              {label}
            </span>
            <span className="text-2xl lg:text-3xl font-bold tracking-tight">
              {value}
            </span>
            {description && (
              <p className={cn(
                "text-xs mt-1",
                isDefault ? "text-muted-foreground" : "text-white/60"
              )}>
                {description}
              </p>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "p-2.5 rounded-xl flex items-center justify-center",
              isDefault 
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
                : "bg-white/10 text-white backdrop-blur-sm"
            )}>
              {/* @ts-ignore */}
              {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Subtle decorative element for Admin variants */}
      {!isDefault && (
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
      )}
    </Card>
  );
}