import React from "react";

export const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`bg-theme-element rounded-3xl p-6 sm:p-8 shadow-xl shadow-theme-accent/5 border border-theme-accent/20 ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`mb-6 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h2 className={`text-2xl font-black text-foreground tracking-tight ${className}`}>
        {children}
    </h2>
);

export const CardDescription = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <p className={`text-sm font-semibold text-foreground/50 mt-1 ${className}`}>
        {children}
    </p>
);

export const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>
        {children}
    </div>
);
