"use client";

import type { SnippetRecord } from "@/lib/storage/types";
import { SnippetTable } from "./snippet-table";
import { NoSnippetsEmptyState } from "@/components/empty-state";

interface SnippetListProps {
  snippets: SnippetRecord[];
  hasFilters: boolean;
  onSnippetClick: (snippetId: string) => void;
}

export function SnippetList({ snippets, hasFilters, onSnippetClick }: SnippetListProps) {
  if (snippets.length === 0) {
    return <NoSnippetsEmptyState hasFilters={hasFilters} />;
  }

  return (
    <SnippetTable snippets={snippets} onSnippetClick={onSnippetClick} />
  );
}