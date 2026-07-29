import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Cache",
    default: "Cache — Self-hosted snippets across browser, CLI, and API",
  },
  description:
    "Public documentation and landing surface for Cache, a self-hosted snippet library with a web app, CLI, and API.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
