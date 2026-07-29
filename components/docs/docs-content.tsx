"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, CopySimple, LinkSimple } from "@phosphor-icons/react";
import { isValidElement, type ReactNode, useState } from "react";
import { Components } from "react-markdown";
import { cn } from "@/lib/utils";

interface DocsContentProps {
  content: string;
}

function omitLeadingPageHeading(content: string) {
  return content.replace(/^\s*#\s+[^\r\n]+(?:\r?\n)+/, "");
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Heading({
  as: Tag,
  children,
  className,
}: {
  as: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className: string;
}) {
  const id = slugify(extractText(children));

  return (
    <Tag id={id || undefined} className={cn("scroll-mt-24", className)}>
      {id ? (
        <a
          href={`#${id}`}
          className="group inline-flex items-center gap-2 no-underline transition-colors hover:text-[var(--accent-primary)]"
        >
          <span>{children}</span>
          <LinkSimple
            aria-hidden="true"
            className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
            weight="bold"
          />
        </a>
      ) : (
        children
      )}
    </Tag>
  );
}

function DocsAnchor({ href, children }: { href?: string; children: ReactNode }) {
  const className =
    "text-[var(--accent-primary)] underline underline-offset-2 transition-colors hover:text-[var(--accent-primary-hover)]";

  if (!href) {
    return <span>{children}</span>;
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <a
      href={href}
      className={className}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-lg border border-[var(--border-subtle)] bg-[#0d0d0d] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[#141414]">
        <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={copied ? "Code copied" : "Copy code to clipboard"}
        >
          {copied ? (
            <>
              <Check aria-hidden="true" className="h-3.5 w-3.5" weight="bold" />
              Copied
            </>
          ) : (
            <>
              <CopySimple aria-hidden="true" className="h-3.5 w-3.5" weight="bold" />
              Copy
            </>
          )}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Code copied" : ""}
        </span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-[#e6e6e6]">{code}</code>
      </pre>
    </div>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <Heading
      as="h1"
      className="mt-8 mb-4 font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]"
    >
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading
      as="h2"
      className="mt-10 mb-4 border-b border-[var(--border-subtle)] pb-2 font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
    >
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading
      as="h3"
      className="mt-8 mb-3 font-heading text-xl font-semibold text-[var(--text-primary)]"
    >
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading
      as="h4"
      className="mt-6 mb-2 font-heading text-lg font-medium text-[var(--text-primary)]"
    >
      {children}
    </Heading>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-7 text-[var(--text-secondary)] mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-2 text-[15px] text-[var(--text-secondary)] mb-4 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-2 text-[15px] text-[var(--text-secondary)] mb-4 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-7">
      <span className="ml-2">{children}</span>
    </li>
  ),
  a: ({ href, children }) => <DocsAnchor href={href}>{children}</DocsAnchor>,
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");
    const isInline = !className && !code.includes("\n");

    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-secondary)] text-[var(--accent-primary)] text-sm font-mono">
          {children}
        </code>
      );
    }

    return <CodeBlock code={code} language={language} />;
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-[var(--border-subtle)]">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)]">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-[var(--border-subtle)]">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-[var(--bg-surface-secondary)]/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-[var(--text-secondary)]">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--accent-primary)] pl-4 py-2 my-4 bg-[var(--accent-primary-soft)]/10 rounded-r-lg">
      <div className="text-[var(--text-secondary)] italic">
        {children}
      </div>
    </blockquote>
  ),
  hr: () => (
    <hr className="my-8 border-[var(--border-subtle)]" />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--text-primary)]">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
};

export function DocsContent({ content }: DocsContentProps) {
  return (
    <div className="docs-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {omitLeadingPageHeading(content)}
      </ReactMarkdown>
    </div>
  );
}
