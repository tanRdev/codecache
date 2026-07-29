import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  label?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  label = "Empty",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="outline" size="sm">{action.label}</Button>
            </Link>
          ) : action.onClick ? (
            <Button variant="outline" size="sm" onClick={action.onClick}>{action.label}</Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function NoSnippetsEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <EmptyState
      label={hasFilters ? "No match" : "Empty"}
      title={hasFilters ? "No snippets found" : "No snippets yet"}
      description={
        hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Create your first snippet to start building your Cache library."
      }
      action={
        !hasFilters
          ? { label: "Create Snippet", href: "/snippets/new" }
          : undefined
      }
    />
  );
}

export function NoSearchResultsEmptyState() {
  return (
    <EmptyState
      label="No results"
      title="No results"
      description="Nothing matched your query. Try different keywords or clear your filters."
    />
  );
}
