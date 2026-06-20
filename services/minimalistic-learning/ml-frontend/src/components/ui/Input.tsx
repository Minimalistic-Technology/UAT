import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordField = type === "password";
        const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

        return (
            <div className="relative w-full">
                <input
                    ref={ref}
                    type={inputType}
                    className={`w-full px-4 py-3 rounded-xl bg-theme-element border ${error ? "border-red-500 focus:ring-red-500/20" : "border-theme-accent/20 focus:border-theme-action focus:ring-theme-action/20"
                        } text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 transition-all ${isPasswordField ? "pr-12" : ""
                        } ${className}`}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
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
