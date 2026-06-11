import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-fit w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-[0.15rem] text-[11px] font-bold tracking-wide uppercase whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#2563eb] text-white [a]:hover:bg-[#1d4ed8] shadow-sm",
        secondary:
          "bg-slate-100 text-slate-800 [a]:hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
        destructive:
          "bg-rose-500/10 text-rose-600 focus-visible:ring-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 [a]:hover:bg-rose-500/20",
        outline:
          "border-slate-200 text-slate-800 [a]:hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:text-slate-300",
        link: "text-[#2563eb] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
