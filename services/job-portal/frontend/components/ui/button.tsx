import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0b5cff]/50 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#0b5cff] text-white shadow-[0_2px_10px_0_rgba(11,92,255,0.2)] hover:bg-[#0042cc] hover:shadow-[0_6px_16px_0_rgba(11,92,255,0.4)] hover:-translate-y-0.5",
        outline:
          "border border-[#c7d2fe] bg-transparent text-[#0b5cff] hover:bg-[#eff6ff] hover:border-[#bfdbfe] dark:border-[#1e3a8a] dark:text-[#60a5fa] dark:hover:bg-[#1e3a8a]/30",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-[#eff6ff] hover:text-[#0b5cff] dark:hover:bg-slate-800 dark:hover:text-slate-100",
        destructive:
          "bg-rose-500 text-white shadow-[0_2px_10px_0_rgba(244,63,94,0.2)] hover:bg-rose-600 hover:shadow-[0_6px_16px_0_rgba(244,63,94,0.4)] hover:-translate-y-0.5 focus-visible:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700",
        link: "text-[#0b5cff] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-7 gap-2",
        xs: "h-7 px-3 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-4 gap-2 text-sm",
        lg: "h-12 px-9 gap-2.5 text-base",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
