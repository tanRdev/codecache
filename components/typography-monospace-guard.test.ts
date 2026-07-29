import { readdirSync, readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..");
const sourceRoots = ["app", "components"];
const sourceFilePattern = /\.(?:css|ts|tsx)$/;
const monospacePattern = /font-mono|monospace|Fira_Code|--font-mono|--font-fira-code|fontFamily/;

const allowedMatchesByFile: Record<string, RegExp[]> = {
  "app/globals.css": [
    /--font-mono: var\(--font-fira-code\);/,
    /--font-fira-code: "SFMono-Regular", "Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;/,
    /--font-fira-code: var\(--font-fira-code\);/,
    /code, pre \{/,
    /font-family: var\(--font-mono\);/,
  ],
  "app/(public)/page.tsx": [
    /font-mono text-\[10px\] text-text-tertiary/,
    /font-mono text-\[9px\]/,
    /mt-1 font-mono text-\[10px\] text-text-tertiary/,
    /bg-\[#09090a\] font-mono text-\[12px\]/,
  ],
  "app/(public)/sign-in/page.tsx": [
    /overflow-x-auto bg-background px-4 py-4 font-mono text-\[13px\] leading-7 text-muted-foreground/,
  ],
  "components/error-boundary.tsx": [
    /<pre className="overflow-auto rounded-lg border border-border-subtle bg-muted px-4 py-3 font-mono text-\[12px\] leading-5 text-muted-foreground whitespace-pre-wrap break-words">/,
  ],
  "components/docs/docs-content.tsx": [
    /<span className="text-xs font-mono text-\[var\(--text-tertiary\)\] uppercase">/,
    /<code className="font-mono text-\[#e6e6e6\]">\{code\}<\/code>/,
    /<code className="px-1\.5 py-0\.5 rounded bg-\[var\(--bg-surface-secondary\)\] text-\[var\(--accent-primary\)\] text-sm font-mono">/,
  ],
  "components/copy-install-command.tsx": [
    /bg-\[#0b0b0c\].*font-mono text-\[12px\]/,
  ],
  "components/snippets/code-block.tsx": [
    /font-mono text-\[13px\] leading-6/,
    /font-mono text-\[11px\] text-text-disabled/,
  ],
  "components/snippets/code-editor.tsx": [
    /fontFamily: "'JetBrains Mono', var\(--font-mono\), monospace",/,
  ],
};

function collectSourceFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (sourceFilePattern.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

describe("website typography monospace guard", () => {
  it("keeps monospace limited to explicit code surfaces", () => {
    const files = sourceRoots.flatMap((dir) => collectSourceFiles(path.join(repoRoot, dir)));
    const unexpectedMatches: string[] = [];

    for (const filePath of files) {
      const relativePath = path.relative(repoRoot, filePath).split(path.sep).join("/");

      if (
        relativePath === "components/typography-monospace-guard.test.ts"
        || relativePath.includes(".test.")
        || relativePath.includes(".spec.")
      ) {
        continue;
      }

      const content = readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      const allowedPatterns = allowedMatchesByFile[relativePath] ?? [];

      lines.forEach((line, index) => {
        if (!monospacePattern.test(line)) {
          return;
        }

        const isAllowed = allowedPatterns.some((pattern) => pattern.test(line));

        if (!isAllowed) {
          unexpectedMatches.push(`${relativePath}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(unexpectedMatches).toEqual([]);
  });
});
