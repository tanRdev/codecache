"use client";

import Link from "next/link";
import { CaretRight, House } from "@phosphor-icons/react";
import { getDocBySlug, docNavigation } from "@/lib/docs";

interface DocsBreadcrumbProps {
  slug: string;
}

export function DocsBreadcrumb({ slug }: DocsBreadcrumbProps) {
  const parts = slug.split("/");
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Docs", href: "/docs" },
  ];

  // Find the section
  const section = docNavigation.find(s => s.slug === parts[0]);
  if (section) {
    breadcrumbs.push({
      label: section.title,
      href: parts.length > 1 ? `/docs/${section.slug}` : undefined,
    });

    // Find the item if there are more parts
    if (parts.length > 1) {
      const itemSlug = parts.join("/");
      const item = getDocBySlug(itemSlug);
      if (item && item.slug !== section.slug) {
        breadcrumbs.push({
          label: item.title,
        });
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/docs"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <House className="size-3.5" />
        <span className="sr-only">Docs</span>
      </Link>

      {breadcrumbs.slice(1).map((crumb) => (
        <div key={crumb.href ?? crumb.label} className="flex items-center gap-1">
          <CaretRight className="size-3.5" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
