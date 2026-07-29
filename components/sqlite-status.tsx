"use client";

import { useEffect, useState } from "react";
import { Database } from "@phosphor-icons/react";

export function SqliteStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/ready");
        if (!cancelled) {
          setStatus(res.ok ? "ok" : "error");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    void check();

    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium text-text-secondary">
      <Database className="size-4 text-text-tertiary" />
      <span className="truncate">SQLite</span>
      <span
        className="ml-auto size-2 rounded-full"
        style={{
          backgroundColor:
            status === "ok" ? "var(--color-green-500, #22c55e)" :
            status === "error" ? "var(--color-red-500, #ef4444)" :
            "var(--color-muted-foreground, #a1a1aa)",
        }}
        title={
          status === "ok" ? "SQLite connected" :
          status === "error" ? "SQLite disconnected" :
          "Checking..."
        }
      />
    </div>
  );
}
