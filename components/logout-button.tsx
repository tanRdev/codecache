"use client";

import { useState } from "react";
import { CircleNotch, SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  onLoggedOut?: () => void;
  iconOnly?: boolean;
};

export function LogoutButton({ className, onLoggedOut, iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const label = isPending ? "Signing out..." : "Sign out";

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      onLoggedOut?.();
      await signOutAction();
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={label}
      title={label}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-tertiary hover:text-foreground focus-visible:outline-none focus-visible:bg-surface-tertiary focus-visible:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {isPending ? (
        <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden="true" />
      ) : (
        <SignOut className="size-4" weight="bold" aria-hidden="true" />
      )}
      {iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </button>
  );
}
