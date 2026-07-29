"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded border text-[13px] leading-none font-medium whitespace-nowrap outline-none select-none focus-visible:border-[var(--border-accent)] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 transition-transform duration-100 ease-out-expo [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent-primary)] bg-primary text-primary-foreground hover:border-[var(--accent-primary-hover)] hover:bg-[var(--accent-primary-hover)]",
        outline:
          "border-border bg-transparent text-foreground hover:border-[var(--border-strong)] hover:bg-secondary aria-expanded:bg-secondary aria-expanded:text-foreground",
        secondary:
          "border-border bg-secondary text-foreground hover:border-[var(--border-strong)] hover:bg-secondary aria-expanded:border-[var(--border-strong)] aria-expanded:bg-secondary",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground",
        destructive:
          "border-destructive/38 bg-destructive/16 text-destructive hover:bg-destructive/22 focus-visible:border-destructive/45 focus-visible:ring-destructive/22",
        link:
          "h-auto border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3",
        xs: "h-7 px-2.5 text-[12px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7.5 px-3 text-[12px] [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 px-4 text-[14px] [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 px-0",
        "icon-xs": "size-7 px-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7.5 px-0",
        "icon-lg": "size-9 px-0 [&_svg:not([class*='size-'])]:size-4",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }