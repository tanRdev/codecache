"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { CacheMark } from "@/components/cache-brand";
import { SqliteStatus } from "@/components/sqlite-status";
import { House } from "@phosphor-icons/react";
import { LogoutButton } from "@/components/logout-button";

function SidebarNavItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] font-medium transition-colors duration-150",
        isActive
          ? "bg-surface-secondary text-foreground"
          : "text-text-secondary hover:bg-surface-secondary hover:text-foreground"
      )}
    >
      <Icon className={cn("size-4", isActive ? "text-accent-primary" : "text-text-tertiary")} />
      <span className="truncate">{children}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-background/95 px-4 backdrop-blur md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-1 py-2 text-sm font-semibold"
        >
          <CacheMark className="size-4 text-accent-primary" />
          Cache
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-secondary hover:text-foreground"
          >
            Library
          </Link>
          <LogoutButton
            className="px-3 py-2 text-xs"
            onLoggedOut={() => {
              router.push("/sign-in");
            }}
          />
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-44 flex-col border-r border-border-subtle bg-surface-primary md:flex">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:border focus:border-border-accent focus:bg-card focus:px-3 focus:py-1.5 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to main content
        </a>

        <div className="flex h-12 items-center px-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-foreground">
            <CacheMark className="size-4 text-accent-primary" />
            <span className="truncate text-[12px] font-semibold tracking-tight">Cache</span>
          </Link>
        </div>

        <div className="mx-3 h-px bg-border-subtle" />

        <nav className="flex-1 overflow-auto scrollbar-slim px-2 py-2">
          <div className="space-y-0.5">
            <SidebarNavItem href="/dashboard" icon={House}>Dashboard</SidebarNavItem>
          </div>
        </nav>

        <div className="mx-3 h-px bg-border-subtle" />

        <div className="p-2 space-y-0.5">
          <SqliteStatus />
          <LogoutButton
            className="px-2.5 py-2 text-[12px]"
            onLoggedOut={() => {
              router.push("/sign-in");
            }}
          />
        </div>
      </aside>

      <main id="main-content" className="min-w-0 md:pl-44" tabIndex={-1}>
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:px-12">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
