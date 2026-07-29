"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowSquareOut,
  CaretDown,
  Code,
  FileText,
  GlobeHemisphereWest,
  Stack,
  TerminalWindow,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CacheBrand } from "@/components/cache-brand";
import { docNavigation, DocSection } from "@/lib/docs";

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "getting-started": FileText,
  cli: TerminalWindow,
  api: GlobeHemisphereWest,
  web: Code,
  features: Stack,
};

function NavSection({
  section,
  isActive,
  onNavigate,
}: {
  section: DocSection;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = sectionIcons[section.slug] || FileText;
  const hasItems = section.items && section.items.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={isActive || open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between px-2 py-1">
        <Link
          href={`/docs/${section.slug}`}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
            pathname === `/docs/${section.slug}`
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          <span>{section.title}</span>
        </Link>
        {hasItems && (
          <CollapsibleTrigger
            aria-label={`${open ? "Collapse" : "Expand"} ${section.title}`}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <CaretDown aria-hidden="true" className="size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        )}
      </div>

      {hasItems && (
        <CollapsibleContent>
          <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-4">
            {section.items?.map((item) => (
              <Link
                key={item.slug}
                href={`/docs/${item.slug}`}
                onClick={onNavigate}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm transition-colors",
                  pathname === `/docs/${item.slug}`
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function DocsSidebarShell({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <CacheBrand href="/" showDescriptor={false} className="transition-opacity duration-150 hover:opacity-80" />
        <div className="mt-4 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Documentation
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Setup, interface notes, and integration reference for the self-hosted app.
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-4">
          {docNavigation.map((section) => (
            <NavSection
              key={section.slug}
              section={section}
              isActive={pathname?.startsWith(`/docs/${section.slug}`)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t border-border p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>← Back to Cache</span>
        </Link>
        <a
          href="https://github.com/tanRdev/codecache"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Repository</span>
          <ArrowSquareOut aria-hidden="true" className="size-4" weight="bold" />
        </a>
      </div>
    </div>
  );
}

export { DocsSidebarShell as DocsSidebar };
