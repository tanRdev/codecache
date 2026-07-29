"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountMenuProps = {
  className?: string;
};

export function AccountMenu({ className }: AccountMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger className={cn("w-full", className)}>
        <span>Account</span>
        <CaretDown
          aria-hidden="true"
          className={cn(
            "size-2.5 transition-transform duration-150 ml-auto",
            isMenuOpen && "rotate-180"
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuSeparator />
        <LogoutButton
          onLoggedOut={() => setIsMenuOpen(false)}
          className="relative flex w-auto cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground outline-none transition-colors duration-150 ease-out hover:bg-secondary hover:text-foreground [&_svg]:mt-px [&_svg]:size-3.5"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
