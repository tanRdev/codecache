import { cn } from "@/lib/utils";
import type { StorageBackend } from "@/lib/storage/types";

const backendLabels: Record<StorageBackend, string> = {
  sqlite: "SQLite",
};

interface StorageBadgeProps {
  backend: StorageBackend;
  className?: string;
}

export function StorageBadge({ backend, className }: StorageBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-border-accent bg-[rgba(255,122,26,0.14)] px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary",
        className
      )}
    >
      {backendLabels[backend]}
    </span>
  );
}
