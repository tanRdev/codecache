import Link from "next/link";
import {
  ArrowRight,
  Code,
  FileText,
  GlobeHemisphereWest,
  Stack,
  TerminalWindow,
} from "@phosphor-icons/react/ssr";
import { docNavigation } from "@/lib/docs";

const sectionIcons = {
  "getting-started": FileText,
  cli: TerminalWindow,
  api: GlobeHemisphereWest,
  web: Code,
  features: Stack,
};

export default function DocsPage() {
  return (
    <div className="space-y-12">
      <div className="max-w-3xl space-y-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Documentation
        </p>
        <h1 className="font-heading text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Documentation
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Install the app, sign in, work from the CLI, and integrate against the API without guessing what is implemented today.
        </p>
      </div>

      <div className="border-t border-border-subtle" />

      <div className="space-y-8">
        {docNavigation.map((section) => {
          const Icon = sectionIcons[section.slug as keyof typeof sectionIcons] ?? FileText;

          return (
            <section key={section.slug} className="grid gap-4 border-b border-border-subtle pb-8 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Icon aria-hidden="true" className="size-5 text-primary" weight="bold" />
                  <h2 className="font-heading text-xl font-medium tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
                <Link
                  href={`/docs/${section.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/85"
                >
                  Open section
                  <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(section.items || []).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className="group border border-border-subtle px-4 py-4 transition-colors hover:border-border-strong hover:bg-secondary/40"
                  >
                    <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="border-t border-border-subtle" />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/docs/getting-started/installation" className="border border-border-subtle px-4 py-4 text-sm transition-colors hover:border-border-strong hover:bg-secondary/40">
          Start with installation
        </Link>
        <Link href="/docs/cli/commands" className="border border-border-subtle px-4 py-4 text-sm transition-colors hover:border-border-strong hover:bg-secondary/40">
          Review CLI commands
        </Link>
        <Link href="/docs/api/endpoints" className="border border-border-subtle px-4 py-4 text-sm transition-colors hover:border-border-strong hover:bg-secondary/40">
          Inspect API endpoints
        </Link>
        <Link href="/docs/features/storage" className="border border-border-subtle px-4 py-4 text-sm transition-colors hover:border-border-strong hover:bg-secondary/40">
          Check storage model
        </Link>
      </div>
    </div>
  );
}
