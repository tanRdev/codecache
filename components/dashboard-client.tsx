"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SnippetList, SearchInput, TagFilter, CreateSnippetModal, SnippetDetailModal } from "@/components/snippets";
import { Plus } from "@phosphor-icons/react";
import type { SnippetRecord } from "@/lib/storage/types";

interface DashboardClientProps {
  snippets: SnippetRecord[];
  allTags: string[];
  hasFilters: boolean;
}

export function DashboardClient({ snippets, allTags, hasFilters }: DashboardClientProps) {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleSnippets = snippets.filter((s) => !deletedIds.has(s.id));

  const handleSnippetClick = (snippetId: string) => {
    setSelectedSnippetId(snippetId);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = (open: boolean) => {
    setDetailModalOpen(open);
    if (!open) {
      setSelectedSnippetId(null);
    }
  };

  const handleSnippetDeleted = () => {
    if (selectedSnippetId) {
      setDeletedIds((prev) => new Set(prev).add(selectedSnippetId));
    }
    handleDetailModalClose(false);
  };

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open);
    if (!open) {
      router.refresh();
    }
  };

  return (
    <div>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Library</h1>
          <p className="text-[13px] text-muted-foreground truncate">
            Search and reuse the code you chose to keep.
          </p>
        </div>

        <Button
          size="sm"
          className="shrink-0 gap-1.5 rounded w-full sm:w-fit"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="size-4" />
          New
        </Button>
      </header>

      <SearchInput className="mb-3 w-full" />

      {allTags.length > 0 ? (
        <div className="mb-6 overflow-hidden">
          <TagFilter tags={allTags} />
        </div>
      ) : null}

      <SnippetList
        snippets={visibleSnippets}
        hasFilters={hasFilters}
        onSnippetClick={handleSnippetClick}
      />

      <CreateSnippetModal open={createModalOpen} onOpenChange={handleCreateModalClose} />

      <SnippetDetailModal
        snippetId={selectedSnippetId}
        open={detailModalOpen}
        onOpenChange={handleDetailModalClose}
        onDeleted={handleSnippetDeleted}
      />
    </div>
  );
}
