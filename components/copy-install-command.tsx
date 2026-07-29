"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

const command =
  "npm install --global https://github.com/tanRdev/codecache/releases/latest/download/codecache-cli.tgz";

export function CopyInstallCommand() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-border-default bg-[#0b0b0c] px-4 py-2.5 font-mono text-[12px] shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:text-[13px]">
      <span aria-hidden="true" className="shrink-0 text-primary">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground">
        {command}
      </code>
      <button
        type="button"
        onClick={copyCommand}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.94]"
        aria-label={copied ? "Install command copied" : "Copy install command"}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4 text-success" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}
