"use client";

import { useState } from "react";
import type { SnippetRecord } from "@/lib/storage/types";
import { getSnippetLanguageLabel } from "./snippet-config";
import { CodeEditor } from "./code-editor";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnippetTableProps {
  snippets: SnippetRecord[];
  onSnippetClick: (snippetId: string) => void;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function SnippetTable({ snippets, onSnippetClick }: SnippetTableProps) {
  return (
    <table className="w-full border-separate border-spacing-y-1">
      <thead>
        <tr className="border-b border-border-subtle text-left">
          <th className="pb-2 pl-3 pr-4 text-[9px] uppercase tracking-[0.2em] text-text-tertiary">
            Title
          </th>
          <th className="hidden pb-2 px-4 text-[9px] uppercase tracking-[0.2em] text-text-tertiary sm:table-cell">
            Language
          </th>
          <th className="hidden pb-2 px-4 text-[9px] uppercase tracking-[0.2em] text-text-tertiary md:table-cell">
            Tags
          </th>
          <th className="hidden pb-2 pl-4 pr-3 text-[9px] uppercase tracking-[0.2em] text-text-tertiary lg:table-cell">
            Updated
          </th>
          <th className="pb-2 pr-3 text-[9px] uppercase tracking-[0.2em] text-text-tertiary">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {snippets.map((snippet) => (
          <SnippetTableRow
            key={snippet.id}
            snippet={snippet}
            onClick={() => onSnippetClick(snippet.id)}
          />
        ))}
      </tbody>
    </table>
  );
}

interface SnippetTableRowProps {
  snippet: SnippetRecord;
  onClick: () => void;
}

function SnippetTableRow({ snippet, onClick }: SnippetTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const languageLabel = getSnippetLanguageLabel(snippet.language);

  return (
    <>
      <tr
        className={cn(
          "group transition-colors duration-100 hover:bg-secondary",
          isExpanded && "[&>td:first-child]:rounded-bl-none [&>td:last-child]:rounded-br-none"
        )}
      >
        <td
          className={cn(
            "py-2 pl-3 pr-4 transition-colors duration-100",
            isExpanded ? "rounded-tl-lg border-l border-t border-r-0 border-b-0 border-border-subtle" : "rounded-l-lg"
          )}
        >
          <button
            type="button"
            onClick={onClick}
            className="text-left w-full"
            aria-label={`View snippet: ${snippet.title}`}
          >
            <span className="text-[13px] font-medium tracking-tight text-foreground transition-colors duration-100 group-hover:text-primary">
              {snippet.title}
            </span>
          </button>
        </td>
        <td
          className={cn(
            "hidden py-2 px-4 sm:table-cell transition-colors duration-100",
            isExpanded && "border-t border-border-subtle"
          )}
        >
          <span className="inline-flex rounded border border-primary/25 bg-primary/8 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-primary/80">
            {languageLabel}
          </span>
        </td>
        <td
          className={cn(
            "hidden py-2 px-4 md:table-cell transition-all duration-100",
            isExpanded && "border-t border-border-subtle"
          )}
        >
          {snippet.tags.length > 0 ? (
            <div className="flex flex-nowrap items-center gap-1">
              {snippet.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 rounded border border-border-subtle bg-white/[0.02] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-text-tertiary"
                >
                  {tag}
                </span>
              ))}
              {snippet.tags.length > 3 && (
                <span className="shrink-0 px-1 text-[9px] text-text-disabled">
                  +{snippet.tags.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.12em] text-text-disabled">
              -
            </span>
          )}
        </td>
        <td
          className={cn(
            "hidden py-2 pr-3 pl-4 lg:table-cell transition-all duration-100",
            isExpanded && "border-t border-border-subtle"
          )}
        >
          <span className="text-[10px] text-text-tertiary">
            {formatDate(snippet.updated_at)}
          </span>
        </td>
        <td
          className={cn(
            "py-2 pr-3 transition-all duration-100",
            isExpanded ? "rounded-tr-lg border-r border-t border-l-0 border-b-0 border-border-subtle" : "rounded-r-lg"
          )}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center justify-center rounded border border-border-subtle bg-white/[0.02] px-2 py-1 text-[10px] text-text-secondary transition-colors duration-100 hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
              aria-label={isExpanded ? "Collapse snippet" : "Expand snippet"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClick}
              className="inline-flex items-center justify-center rounded border border-border-subtle bg-white/[0.02] px-2 py-1 text-[10px] text-text-secondary transition-colors duration-100 hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
              aria-label={`View ${snippet.title}`}
            >
              View
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={5}
            className="rounded-b-lg border-x border-b border-border-subtle px-3 pb-3"
          >
            <div className="overflow-hidden rounded">
              <CodeEditor
                value={snippet.code}
                onChange={() => {}}
                language={snippet.language}
                readOnly
                height={200}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
