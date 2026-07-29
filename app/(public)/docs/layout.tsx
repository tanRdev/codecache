"use client";

import { List } from "@phosphor-icons/react";
import { useState } from "react";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
          <DocsSidebar />
        </aside>

        {/* Mobile sidebar toggle - shown only on small screens */}
        <div className="border-b border-border-subtle bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Documentation</p>
              <p className="text-sm text-foreground">Guides, setup, and API reference</p>
            </div>

            <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Open documentation navigation"
                    className="gap-2"
                  />
                }
              >
                <List aria-hidden="true" className="size-4" />
                Browse
              </SheetTrigger>

              <SheetContent side="left" className="w-[min(90vw,22rem)] border-r border-border bg-background p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Documentation navigation</SheetTitle>
                  <SheetDescription>Browse guides, reference pages, and feature documentation.</SheetDescription>
                </SheetHeader>
                <DocsSidebar onNavigate={() => setNavigationOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main content */}
        <main id="docs-content" tabIndex={-1} className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
