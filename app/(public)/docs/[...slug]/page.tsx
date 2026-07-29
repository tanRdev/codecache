import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocBySlug, getDocContent, docNavigation } from "@/lib/docs-server";
import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { DocsContent } from "@/components/docs/docs-content";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const doc = getDocBySlug(fullSlug);
  const description = doc?.description ?? "Documentation for the self-hosted Cache app, CLI, and API.";

  return {
    title: doc?.title ?? "Documentation",
    description,
    alternates: {
      canonical: `/docs/${fullSlug}`,
    },
    openGraph: {
      title: doc?.title ?? "Documentation",
      description,
      type: "article",
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  const doc = getDocBySlug(fullSlug);

  if (!doc) {
    notFound();
  }

  const content = getDocContent(fullSlug);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Documentation
        </p>
        <DocsBreadcrumb slug={fullSlug} />
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            {doc.description}
          </p>
        )}
      </div>

      <Separator />

      <DocsContent content={content || ""} />
    </div>
  );
}

// Generate static params for all documentation pages
export function generateStaticParams() {
  const slugs: { slug: string[] }[] = [];

  for (const section of docNavigation) {
    slugs.push({ slug: [section.slug] });
    for (const item of section.items || []) {
      slugs.push({ slug: item.slug.split("/") });
    }
  }

  return slugs;
}
