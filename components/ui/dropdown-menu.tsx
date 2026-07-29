"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

function DropdownMenuTrigger({ className, children, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "relative z-50 inline-flex min-h-8 items-center gap-2 rounded-lg border border-border-subtle bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-accent hover:bg-[rgba(255,122,26,0.12)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // When open: change appearance but keep full border
        "[&[data-state='open']]:bg-surface-secondary [&[data-state='open']]:text-foreground [&[data-state='open']]:focus-visible:ring-0 [&[data-state='open']]:focus-visible:ring-offset-0",
        className
      )}
      {...props}
    >
      {children}
    </MenuPrimitive.Trigger>
  )
}

function DropdownMenuContent({
  className,
  side = "bottom",
  sideOffset = 2,
  align = "end",
  ...props
}: MenuPrimitive.Positioner.Props & MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "relative z-50 min-w-[12rem] origin-(--transform-origin) rounded-lg border border-border-subtle bg-surface-secondary p-1 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl",
            "duration-150 ease-out data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-secondary outline-none transition-colors duration-150 ease-out hover:bg-surface-tertiary hover:text-foreground focus-visible:bg-surface-tertiary focus-visible:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px bg-border-subtle", className)}
      {...props}
    />
  )
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-group"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
}
