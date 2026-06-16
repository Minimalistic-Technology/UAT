import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditProfileInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelRight?: React.ReactNode;
  containerClassName?: string;
  children?: React.ReactNode;
}

export const editInputBase =
  "h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-lg text-sm";

export function EditProfileInputField({
  label,
  labelRight,
  containerClassName,
  children,
  className,
  ...props
}: EditProfileInputFieldProps) {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {labelRight ? (
        <div className="flex items-center justify-between">
          <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
            {label}
          </Label>
          <div className="flex items-center gap-0.5 text-[9px] font-bold tracking-wide text-blue-600 uppercase dark:text-blue-400">
            {labelRight}
          </div>
        </div>
      ) : (
        <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
          {label}
        </Label>
      )}

      {children ?? (
        <Input className={cn(editInputBase, className)} {...props} />
      )}
    </div>
  );
}
