import { auth } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard-client";
import { listSnippets, getUserTags } from "@/lib/core/services/snippets";

export const metadata = {
  title: "Library",
  description: "Browse and manage your saved code in Cache.",
};

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Sign in to view your snippets.</div>;
  }

  const query = params.q;
  const selectedTags = params.tags?.split(",").filter(Boolean);
  const [snippets, allTags] = await Promise.all([
    listSnippets({ userId }, { query, tags: selectedTags }),
    getUserTags({ userId }),
  ]);
  const hasFilters = Boolean(query || (selectedTags && selectedTags.length > 0));

  return <DashboardClient snippets={snippets} allTags={allTags} hasFilters={hasFilters} />;
}
