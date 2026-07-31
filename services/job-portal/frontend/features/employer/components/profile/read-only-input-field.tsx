import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  placeholder?: string; // shown when value is empty, styled as muted+italic
  className?: string; // col-span overrides etc.
  children?: React.ReactNode; // escape hatch for custom inputs (e.g. phone)
}

const inputBase =
  "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-10 rounded-xl pointer-events-none";

export function ReadOnlyField({
  label,
  value,
  placeholder,
  className,
  children,
}: ReadOnlyFieldProps) {
  const isEmpty = !value;
  const displayValue = isEmpty && placeholder ? placeholder : value;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </Label>
      {children ?? (
        <Input
          value={displayValue}
          readOnly
          className={cn(
            inputBase,
            isEmpty && placeholder
              ? "text-slate-400 italic dark:text-slate-500"
              : "text-slate-700 dark:text-slate-200",
          )}
        />
      )}
    </div>
  );
}

// Export inputBase so the phone composite can reuse the same styles
export { inputBase };
