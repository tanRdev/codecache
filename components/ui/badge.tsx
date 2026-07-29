import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2.5 py-0 font-medium whitespace-nowrap focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-primary/22 bg-primary/16 text-primary",
        secondary:
          "border-[var(--border-subtle)] bg-secondary text-muted-foreground",
        success:
          "border-accent-success/22 bg-accent-success/14 text-accent-success",
        warning:
          "border-accent-warning/22 bg-accent-warning/14 text-accent-warning",
        danger:
          "border-accent-danger/22 bg-accent-danger/14 text-accent-danger",
        info:
          "border-accent-info/22 bg-accent-info/14 text-accent-info",
        slate:
          "border-accent-slate/22 bg-accent-slate/14 text-accent-slate",
        destructive:
          "border-accent-danger/22 bg-accent-danger/14 text-accent-danger",
      },
      size: {
        sm: "h-5 text-[11px]",
        md: "h-6 px-3 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "sm",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
      state: {
        slot: "badge",
        variant,
        size,
      },
    })
}

export { Badge, badgeVariants }
