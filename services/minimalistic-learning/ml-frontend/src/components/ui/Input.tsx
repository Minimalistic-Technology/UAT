import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`w-full px-4 py-3 rounded-xl bg-theme-element border ${error ? "border-red-500 focus:ring-red-500/20" : "border-theme-accent/20 focus:border-theme-action focus:ring-theme-action/20"
                    } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 transition-all ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = "", error, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`w-full px-4 py-3 rounded-xl bg-theme-element border ${error ? "border-red-500 focus:ring-red-500/20" : "border-theme-accent/20 focus:border-theme-action focus:ring-theme-action/20"
                    } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 transition-all resize-y ${className}`}
                {...props}
            />
        );
    }
);

Textarea.displayName = "Textarea";
