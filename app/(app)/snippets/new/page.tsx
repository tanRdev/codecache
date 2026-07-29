import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StorageBadge } from "@/components/storage-badge";
import { CreateSnippetForm } from "@/components/snippets";

export const metadata = {
  title: "New Snippet",
  description: "Create a new saved snippet in Cache.",
};

export const dynamic = "force-dynamic";

export default async function NewSnippetPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col px-6 py-6 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to library
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-primary">New snippet</span>
          <StorageBadge backend="sqlite" />
        </div>
      </div>

      <CreateSnippetForm />
    </div>
  );
}
