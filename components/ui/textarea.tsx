import * as React from "react"

import { cn } from "@/lib/utils"
import { controlClassName, controlTextareaClassName } from "@/components/ui/control-styles"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        controlClassName,
        controlTextareaClassName,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
