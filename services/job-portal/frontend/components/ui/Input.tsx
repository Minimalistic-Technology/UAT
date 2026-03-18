import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-800">
            {label}
          </label>
        )}

        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full rounded-xl border bg-white
              px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
              shadow-sm transition-all duration-200
              
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              focus:shadow-md
              
              disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
              
              ${error
                ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
              }
              
              ${icon ? "pl-10" : ""}
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";