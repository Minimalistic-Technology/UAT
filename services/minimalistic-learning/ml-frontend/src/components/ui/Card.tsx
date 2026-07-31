import React from "react";

export const Card = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-theme-element shadow-theme-accent/5 border-theme-accent/20 rounded-3xl border p-6 shadow-xl sm:p-8 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`mb-6 ${className}`}>{children}</div>;

export const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={`text-foreground text-2xl font-black tracking-tight ${className}`}
  >
    {children}
  </h2>
);

export const CardDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-foreground/50 mt-1 text-sm font-semibold ${className}`}>
    {children}
  </p>
);

export const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;
