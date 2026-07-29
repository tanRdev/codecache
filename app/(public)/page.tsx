import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";
import { CacheBrand, CacheMark } from "@/components/cache-brand";
import { CopyInstallCommand } from "@/components/copy-install-command";
import {
  FileSearchIcon,
  FolderAddIcon,
  LaptopIcon,
  ServerIcon,
} from "@/components/icons/isometric";
import { isMarketingDeployment } from "@/lib/deployment-mode";

const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-5 text-sm font-medium text-background transition-[background-color,border-color,transform] duration-150 ease-out hover:border-primary/85 hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]";

const secondaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-transparent px-5 text-sm font-medium text-foreground transition-[background-color,border-color,transform] duration-150 ease-out hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]";

const features = [
  {
    icon: FileSearchIcon,
    title: "Find it while the thought is fresh",
    description:
      "Search titles, code, notes, languages, and tags from the terminal or the browser.",
  },
  {
    icon: FolderAddIcon,
    title: "Keep the useful context",
    description:
      "Save notes and attach reference files so a snippet still makes sense months later.",
  },
  {
    icon: ServerIcon,
    title: "Own the whole library",
    description:
      "One SQLite file and a local attachments folder. Easy to inspect, move, and back up.",
  },
];

const previewSnippets = [
  { title: "useLocalStorage", language: "TypeScript", tags: ["react", "browser"] },
  { title: "Retry with backoff", language: "TypeScript", tags: ["async", "network"] },
  { title: "Docker healthcheck", language: "Shell", tags: ["docker", "ops"] },
];

function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-[#09090a] shadow-[0_32px_100px_rgba(0,0,0,0.42)]">
      <div className="flex h-11 items-center justify-between border-b border-border-subtle px-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
          <span className="size-2.5 rounded-full bg-[#f7bd4f]" />
          <span className="size-2.5 rounded-full bg-[#63c66d]" />
        </div>
        <span className="font-mono text-[10px] text-text-tertiary">localhost:3000</span>
        <span className="w-[46px]" />
      </div>

      <div className="grid min-h-[390px] grid-cols-1 sm:grid-cols-[150px_1fr]">
        <aside className="hidden border-r border-border-subtle bg-[#0d0d0e] p-4 sm:block">
          <div className="mb-7 flex items-center gap-2 text-xs font-semibold">
            <CacheMark className="size-4" />
            Cache
          </div>
          <div className="rounded-md bg-surface-secondary px-3 py-2 text-[11px] text-foreground">
            Library
          </div>
          <div className="mt-2 px-3 py-2 text-[11px] text-text-tertiary">Tags</div>
          <div className="mt-[210px] flex items-center gap-2 text-[10px] text-text-tertiary">
            <span className="size-1.5 rounded-full bg-success" />
            SQLite ready
          </div>
        </aside>

        <div className="p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                Local library
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Your snippets</h2>
            </div>
            <div className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-[11px] font-medium text-background">
              New snippet
            </div>
          </div>

          <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-border-default bg-surface-primary px-3 text-[11px] text-text-tertiary">
            <FileSearchIcon className="size-4" />
            Search code, notes, or tags
            <kbd className="ml-auto rounded border border-border-default px-1.5 py-0.5 font-mono text-[9px]">
              /
            </kbd>
          </div>

          <div className="space-y-2">
            {previewSnippets.map((snippet, index) => (
              <div
                key={snippet.title}
                className="rounded-md border border-border-subtle bg-surface-primary p-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">{snippet.title}</p>
                    <p className="mt-1 font-mono text-[10px] text-text-tertiary">
                      {index === 0 ? "export function useLocalStorage<T>(key: string) {" : "Reusable implementation with notes"}
                    </p>
                  </div>
                  <span className="text-[9px] text-text-tertiary">{snippet.language}</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-border-subtle bg-secondary px-1.5 py-0.5 text-[9px] text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const marketing = isMarketingDeployment();
  const primaryHref = marketing ? "/docs/getting-started/installation" : "/dashboard";
  const primaryLabel = marketing ? "Install Cache" : "Open your library";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header className="border-b border-border-subtle">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <CacheBrand href="/" showDescriptor={false} />
          <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/docs"
              className="rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-secondary hover:text-foreground"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/tanRdev/codecache"
              className="hidden rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
            >
              GitHub
            </Link>
            {marketing ? null : (
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-secondary hover:text-foreground"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="relative border-b border-border-subtle">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(244,120,52,0.11),transparent_32%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                <span className="size-1.5 rounded-full bg-primary" />
                Open source · local first
              </div>
              <h1 className="max-w-[680px] text-[clamp(2.8rem,8vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
                Your personal code library,{" "}
                <span className="text-primary">on your machine.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-7 text-text-secondary sm:text-[17px]">
                Save the code worth reusing, find it without breaking flow, and keep every
                snippet in a SQLite file you control. No account or subscription required.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className={primaryButton}>
                  {primaryLabel}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  href="https://github.com/tanRdev/codecache"
                  className={secondaryButton}
                >
                  <GithubLogo aria-hidden="true" className="size-4" />
                  View source
                </Link>
              </div>
              <div className="mt-6 max-w-lg">
                <CopyInstallCommand />
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-tertiary">
                {["Self-hosted", "SQLite + local files", "Browser, CLI, and API"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check aria-hidden="true" className="size-3.5 text-primary" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="lg:translate-x-5">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <p className="type-meta-xs text-primary">Built for recall</p>
              <h2 className="mt-3 type-display-sm">A small tool that earns its place.</h2>
              <p className="mt-4 max-w-xl type-body-lg text-text-secondary">
                Cache keeps the useful parts of your past work close without turning them
                into another hosted service to maintain.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="bg-background p-6 sm:p-7">
                  <div className="mb-5 flex size-9 items-center justify-center rounded-md border border-border-default bg-surface-primary text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-text-secondary">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border-subtle">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="type-meta-xs text-primary">One library, two surfaces</p>
              <h2 className="mt-3 type-display-sm">Fast in the terminal. Clear in the browser.</h2>
              <p className="mt-4 type-body-lg text-text-secondary">
                Capture without leaving your editor, then browse and edit when you want
                more room. Both use the same local data.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-border-default bg-[#09090a] font-mono text-[12px]">
              <div className="border-b border-border-subtle px-4 py-3 text-[10px] text-text-tertiary">
                cache — local
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p>
                  <span className="mr-3 text-primary">$</span>
                  <span>cache add ./retry.ts --tag typescript --tag network</span>
                </p>
                <p className="text-success">✓ Saved “Retry with backoff”</p>
                <p>
                  <span className="mr-3 text-primary">$</span>
                  <span>cache search backoff</span>
                </p>
                <div className="rounded-md border border-border-subtle bg-surface-primary p-3 text-text-secondary">
                  <span className="text-foreground">Retry with backoff</span>
                  <span className="ml-2">[typescript · network]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="relative overflow-hidden rounded-xl border border-border-default bg-surface-primary px-6 py-12 sm:px-12 sm:py-14">
              <div
                aria-hidden="true"
                className="absolute right-0 top-0 size-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
              />
              <div className="relative max-w-2xl">
                <LaptopIcon className="mb-6 size-8 text-primary" />
                <h2 className="type-display-sm">Keep it local. Make it useful.</h2>
                <p className="mt-4 max-w-xl type-body-lg text-text-secondary">
                  Install Cache, add your first snippet, and keep the database wherever
                  you already back up important work.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/docs/getting-started/installation" className={primaryButton}>
                    Read the quickstart
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <Link
                    href="https://github.com/tanRdev/codecache"
                    className={secondaryButton}
                  >
                    Browse the repository
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-[11px] text-text-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <CacheMark className="size-4" />
            <span>Cache — local-first code reuse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="transition-colors hover:text-foreground">
              Docs
            </Link>
            <Link
              href="https://github.com/tanRdev/codecache"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
