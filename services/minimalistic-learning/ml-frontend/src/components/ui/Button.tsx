import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "none";
    size?: "sm" | "md" | "lg" | "none";
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", fullWidth = false, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-theme-action text-white hover:bg-black dark:hover:bg-white dark:hover:text-black shadow-lg shadow-theme-action/20 hover:shadow-xl hover:-translate-y-0.5",
            secondary: "bg-theme-element-sec text-foreground hover:bg-theme-accent/10 border border-theme-accent/20 hover:shadow-md hover:-translate-y-0.5",
            outline: "border-2 border-theme-action text-theme-action hover:bg-theme-action hover:text-white hover:shadow-lg hover:-translate-y-0.5",
            ghost: "text-foreground/70 hover:text-foreground hover:bg-theme-element-sec hover:shadow-sm",
            danger: "bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-600/20 hover:shadow-lg hover:shadow-red-600/20",
            none: "",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs",
            md: "px-6 py-3 text-sm",
            lg: "px-8 py-4 text-base",
            none: "",
        };

        const widthStyle = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
