import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[2.6rem] w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 px-4 py-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-background file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#2563eb]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-2 aria-invalid:ring-rose-500/20 dark:bg-slate-900/50 dark:disabled:bg-slate-800/80 dark:aria-invalid:border-rose-500/50 dark:aria-invalid:ring-rose-500/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
