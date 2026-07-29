"use client";

import type { SnippetRecord } from "@/lib/storage/types";
import { getSnippetLanguageLabel } from "./snippet-config";

interface SnippetCardProps {
  snippet: SnippetRecord;
  onClick: () => void;
}

export function SnippetCard({ snippet, onClick }: SnippetCardProps) {
  const languageLabel = getSnippetLanguageLabel(snippet.language);

  return (
    <li className="h-full list-none">
      <button
        type="button"
        onClick={onClick}
        aria-label={`View snippet: ${snippet.title}`}
        className="group flex h-full w-full flex-col justify-between border border-border bg-card p-6 text-left transition-[background-color,border-color,transform] duration-180 ease-out-expo hover:border-border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="border border-border-accent bg-[var(--accent-primary-soft)] px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
              {languageLabel}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary">
              {snippet.title}
            </h3>
            {snippet.description ? (
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {snippet.description}
              </p>
            ) : snippet.notes ? (
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {snippet.notes}
              </p>
            ) : (
              <p className="line-clamp-2 text-sm leading-6 text-text-tertiary">
                No description yet. Open this snippet to inspect the code and notes.
              </p>
            )}
          </div>
        </div>

        {snippet.tags.length > 0 && (
          <div className="mt-5 border-t border-border-subtle pt-4 text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
            {snippet.tags.join(" · ")}
          </div>
        )}
      </button>
    </li>
  );
}
