import { notFound } from "next/navigation";
import { getAttachments } from "@/app/actions/attachments";
import { SnippetDetail } from "@/components/snippets";
import { auth } from "@/lib/auth";
import { getSnippetById } from "@/lib/core/services/snippets";

interface SnippetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Snippet",
  description: "View and manage your saved code snippet.",
};

export const dynamic = "force-dynamic";

export default async function SnippetDetailPage({ params }: SnippetDetailPageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const [snippet, attachmentsResult] = await Promise.all([
    getSnippetById({ userId }, id),
    getAttachments(id),
  ]);

  if (!snippet) {
    notFound();
  }

  return (
    <div className="space-y-6 px-6 py-8 md:px-8 md:py-10 lg:px-12">
      <SnippetDetail
        snippet={snippet}
        storageBackend="sqlite"
        initialAttachments={attachmentsResult.success ? attachmentsResult.attachments ?? [] : []}
      />
    </div>
  );
}
