import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { docNavigation, getDocBySlug, type DocItem } from "./docs";

export { docNavigation, getDocBySlug };
export type { DocItem, DocSection } from "./docs";

function slugToFilePath(slug: string): string {
  const contentDir = join(process.cwd(), "content", "docs");

  if (slug === "getting-started") {
    return join(contentDir, "getting-started.md");
  }

  if (slug === "cli") {
    return join(contentDir, "cli.md");
  }

  if (slug === "api") {
    return join(contentDir, "api.md");
  }

  if (slug === "web") {
    return join(contentDir, "web.md");
  }

  if (slug === "features") {
    return join(contentDir, "features.md");
  }

  return join(contentDir, `${slug}.md`);
}

export function getDocContent(slug: string): string | null {
  const doc = getDocBySlug(slug);
  if (!doc) return null;

  const filePath = slugToFilePath(slug);

  if (!existsSync(filePath)) {
    return `# ${doc.title}

${doc.description || ""}

This page is not published yet.

## Continue Browsing

Use the navigation to explore the rest of the documentation, or review the repository README for setup and verification commands.`;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading documentation file: ${filePath}`, error);
    return `# ${doc.title}

${doc.description || ""}

Error loading documentation. Please try again later.`;
  }
}

export function getAllDocSlugs(): string[] {
  const slugs: string[] = [];
  for (const section of docNavigation) {
    slugs.push(section.slug);
    for (const item of section.items || []) {
      slugs.push(item.slug);
    }
  }
  return slugs;
}

export function getBreadcrumbs(slug: string): Array<{ title: string; slug: string }> {
  const breadcrumbs: Array<{ title: string; slug: string }> = [];

  for (const section of docNavigation) {
    if (section.slug === slug) {
      breadcrumbs.push({ title: section.title, slug: section.slug });
      return breadcrumbs;
    }

    for (const item of section.items || []) {
      if (item.slug === slug) {
        breadcrumbs.push({ title: section.title, slug: `/docs/${section.slug}` });
        breadcrumbs.push({ title: item.title, slug: `/docs/${item.slug}` });
        return breadcrumbs;
      }
    }
  }

  return breadcrumbs;
}

export function getAdjacentDocs(slug: string): { prev?: DocItem; next?: DocItem } {
  const allItems: DocItem[] = [];

  for (const section of docNavigation) {
    allItems.push({ title: section.title, slug: section.slug });
    for (const item of section.items || []) {
      allItems.push(item);
    }
  }

  const currentIndex = allItems.findIndex((item) => item.slug === slug);
  if (currentIndex === -1) return {};

  return {
    prev: currentIndex > 0 ? allItems[currentIndex - 1] : undefined,
    next: currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : undefined,
  };
}
