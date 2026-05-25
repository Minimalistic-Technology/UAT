import React from 'react';
import { cn } from './Button'; // reuse cn util

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label className="block text-sm font-medium mb-2 text-muted-foreground">{label}</label>}
                <input
                    ref={ref}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-secondary/50 bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all shadow-inner",
                        error && "border-red-500/50 focus-visible:ring-red-500/50",
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
