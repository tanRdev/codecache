"use client";

import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { getPrismLanguage, getSnippetLanguageLabel } from "./snippet-config";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const prismLanguage = getPrismLanguage(language);
  const languageLabel = getSnippetLanguageLabel(language);
  const lineKeyCounts = new Map<string, number>();

  return (
    <section
      aria-label={`${languageLabel} code block`}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      <Highlight theme={themes.nightOwl} code={code} language={prismLanguage}>
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              highlightClassName,
              "overflow-x-auto scrollbar-slim rounded-lg px-0 py-4 font-mono text-[13px] leading-6",
            )}
            style={{ ...style, backgroundColor: "transparent", margin: 0 }}
          >
            {tokens.map((line, lineIndex) => {
              if (lineIndex === tokens.length - 1 && line.length === 1 && line[0].empty) {
                return null;
              }

              const lineSignature = line
                .map((token) => `${token.content}:${token.types.join(".")}`)
                .join("|");
              const lineCount = lineKeyCounts.get(lineSignature) ?? 0;
              lineKeyCounts.set(lineSignature, lineCount + 1);
              const lineKey = `${lineSignature}-${lineCount}`;
              const tokenKeyCounts = new Map<string, number>();

              return (
                <div
                  key={lineKey}
                  {...getLineProps({ line })}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-0 px-4"
                >
                  <span className="select-none pr-4 text-right font-mono text-[11px] text-text-disabled">
                    {lineIndex + 1}
                  </span>
                  <span className="min-w-0 text-foreground">
                    {line.map((token) => {
                      const tokenSignature = `${token.content}:${token.types.join(".")}`;
                      const tokenCount = tokenKeyCounts.get(tokenSignature) ?? 0;
                      tokenKeyCounts.set(tokenSignature, tokenCount + 1);

                      return (
                        <span
                          key={`${lineKey}-${tokenSignature}-${tokenCount}`}
                          {...getTokenProps({ token })}
                        />
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </section>
  );
}
