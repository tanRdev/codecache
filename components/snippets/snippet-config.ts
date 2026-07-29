export const SNIPPET_LANGUAGE_OPTIONS = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "other", label: "Other" },
];

const PRISM_LANGUAGE_MAP = new Map<string, string>([
  ["typescript", "typescript"],
  ["javascript", "javascript"],
  ["python", "python"],
  ["java", "java"],
  ["csharp", "csharp"],
  ["cpp", "cpp"],
  ["go", "go"],
  ["rust", "rust"],
  ["ruby", "ruby"],
  ["php", "php"],
  ["swift", "swift"],
  ["kotlin", "kotlin"],
  ["sql", "sql"],
  ["html", "html"],
  ["css", "css"],
  ["bash", "bash"],
  ["json", "json"],
  ["yaml", "yaml"],
  ["markdown", "markdown"],
  ["other", "text"],
  ["text", "text"],
  ["plaintext", "text"],
]);

const MONACO_LANGUAGE_MAP = new Map<string, string>([
  ["typescript", "typescript"],
  ["javascript", "javascript"],
  ["python", "python"],
  ["java", "java"],
  ["csharp", "csharp"],
  ["cpp", "cpp"],
  ["go", "go"],
  ["rust", "rust"],
  ["ruby", "ruby"],
  ["php", "php"],
  ["swift", "swift"],
  ["kotlin", "kotlin"],
  ["sql", "sql"],
  ["html", "html"],
  ["css", "css"],
  ["bash", "shell"],
  ["json", "json"],
  ["yaml", "yaml"],
  ["markdown", "markdown"],
  ["other", "plaintext"],
  ["text", "plaintext"],
  ["plaintext", "plaintext"],
]);

export function getSnippetLanguageLabel(language: string) {
  const normalizedLanguage = normalizeSnippetLanguage(language);

  if (!normalizedLanguage || normalizedLanguage === "plaintext") {
    return "Plain Text";
  }

  const option = SNIPPET_LANGUAGE_OPTIONS.find((item) => item.value === normalizedLanguage);

  if (option) {
    return option.label;
  }

  return normalizedLanguage;
}

export function getPrismLanguage(language: string) {
  return PRISM_LANGUAGE_MAP.get(normalizeSnippetLanguage(language)) ?? "text";
}

export function getMonacoLanguage(language: string) {
  return MONACO_LANGUAGE_MAP.get(normalizeSnippetLanguage(language)) ?? "plaintext";
}

export function normalizeSnippetTag(tag: string) {
  return tag.trim().toLowerCase();
}

function normalizeSnippetLanguage(language: string) {
  return language.trim().toLowerCase();
}

const LANGUAGE_PATTERNS: Array<{ language: string; patterns: RegExp[] }> = [
  {
    language: "typescript",
    patterns: [
      /^import\s+type\s+/m,
      /^interface\s+\w+\s*\{/m,
      /^type\s+\w+\s*=/m,
      /:\s*(string|number|boolean|any|void|never)\b/,
      /<\w+>\s*\(/,
      /\bas\s+\w+/,
      /:\s*\{[^}]*\}\s*[;,)]/,
    ],
  },
  {
    language: "javascript",
    patterns: [
      /^const\s+\w+\s*=\s*require\(/m,
      /^module\.exports\s*=/m,
      /export\s+default\s+/m,
      /=>\s*\{/,
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bvar\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
    ],
  },
  {
    language: "python",
    patterns: [
      /^def\s+\w+\s*\(.*\):/m,
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /if\s+__name__\s*==\s*['"]__main__['"]/,
      /\bself\.\w+/,
      /\bclass\s+\w+(\([^)]*\))?:/,
      /:\s*(None|True|False)\b/,
      /print\s*\(/,
    ],
  },
  {
    language: "java",
    patterns: [
      /^package\s+[\w.]+;/m,
      /^import\s+java\./m,
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.print/,
      /@\w+\s*(public|private|protected)/,
    ],
  },
  {
    language: "go",
    patterns: [
      /^package\s+\w+/m,
      /^import\s*\(/m,
      /func\s+\w+\s*\(/,
      /func\s*\(\w+\s+\*?\w+\)/,
      /\bdefer\s+/,
      /:=\s*/,
      /\bgo\s+\w+\(/,
    ],
  },
  {
    language: "rust",
    patterns: [
      /^use\s+std::/m,
      /^fn\s+\w+\s*\(/m,
      /\blet\s+(mut\s+)?\w+\s*:/,
      /\bimpl\s+\w+/,
      /\bmatch\s+\w+\s*\{/,
      /\bResult</,
      /\bOption</,
      /&mut\s+/,
      /\bpub\s+(fn|struct|enum|trait)/,
    ],
  },
  {
    language: "ruby",
    patterns: [
      /^require\s+['"]/m,
      /\bdef\s+\w+/,
      /\bend\b/,
      /\bclass\s+\w+\s*<\s*\w+/,
      /\battr_accessor\b/,
      /\bdo\s*\|/,
      /\bputs\s+/,
    ],
  },
  {
    language: "php",
    patterns: [
     /<\?php/,
      /\$\w+/,
      /function\s+\w+\s*\(/,
      /=>\s*\[/,
      /\buse\s+\w+\\/,
    ],
  },
  {
    language: "csharp",
    patterns: [
      /^using\s+System/m,
      /^namespace\s+[\w.]+/m,
      /\bpublic\s+class\s+\w+/,
      /\bprivate\s+\w+\s+\w+/,
      /\bvar\s+\w+\s*=/,
      /\basync\s+Task/,
      /\bnamespace\s+/,
    ],
  },
  {
    language: "cpp",
    patterns: [
      /^#include\s*<[\w.]+>/m,
      /^#include\s*"[^"]+"/m,
      /\bstd::/,
      /\bint\s+main\s*\(/,
      /\bcout\s*<</,
      /\bnamespace\s+\w+/,
      /\bclass\s+\w+\s*:/,
      /template\s*</,
    ],
  },
  {
    language: "swift",
    patterns: [
      /^import\s+\w+/m,
      /\bfunc\s+\w+\s*\(/,
      /\blet\s+\w+\s*:/,
      /\bvar\s+\w+\s*:/,
      /\bguard\s+let/,
      /\bif\s+let/,
      /\bswitch\s+\w+\s*\{/,
      /\benum\s+\w+\s*\{/,
    ],
  },
  {
    language: "kotlin",
    patterns: [
      /^package\s+[\w.]+/m,
      /^import\s+[\w.]+/m,
      /\bfun\s+\w+\s*\(/,
      /\bval\s+\w+\s*:/,
      /\bvar\s+\w+\s*:/,
      /\bdata\s+class\s+/,
      /\bcompanion\s+object/,
      /\bsuspend\s+fun/,
    ],
  },
  {
    language: "sql",
    patterns: [
      /^\s*SELECT\s+/im,
      /^\s*INSERT\s+INTO/im,
      /^\s*UPDATE\s+\w+\s+SET/im,
      /^\s*DELETE\s+FROM/im,
      /^\s*CREATE\s+TABLE/im,
      /^\s*ALTER\s+TABLE/im,
      /^\s*DROP\s+TABLE/im,
      /FROM\s+\w+\s+WHERE/i,
      /JOIN\s+\w+\s+ON/i,
    ],
  },
  {
    language: "html",
    patterns: [
      /^<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<div[\s>]/,
      /<script[\s>]/,
      /<style[\s>]/,
    ],
  },
  {
    language: "css",
    patterns: [
      /^\s*\.[\w-]+\s*\{/m,
      /^\s*#[\w-]+\s*\{/m,
      /^\s*[\w-]+\s*:\s*[\w#]+;/m,
      /@media\s+/,
      /@keyframes\s+/,
      /display:\s*(flex|grid|block|inline)/i,
    ],
  },
  {
    language: "bash",
    patterns: [
      /^#!/m,
      /^\s*export\s+\w+/m,
      /^\s*echo\s+/m,
      /\bif\s*\[\[/,
      /\bfor\s+\w+\s+in\s+/,
      /\bwhile\s+\[/,
      /\|\|/,
      /&&/,
      /\$\{\w+\}/,
    ],
  },
  {
    language: "json",
    patterns: [
      /^\s*\{/m,
      /^\s*\[/m,
      /"\w+"\s*:/,
      /:\s*"[^"]*"/,
      /:\s*\d+/,
      /:\s*(true|false|null)\b/,
    ],
  },
  {
    language: "yaml",
    patterns: [
      /^\s*[\w-]+:\s*$/m,
      /^\s*[\w-]+:\s+\S/m,
      /^---$/m,
      /\$\{\{/,
      /^\s*-\s+\w+/m,
      /^\s+-\s+$/m,
    ],
  },
  {
    language: "markdown",
    patterns: [
      /^#{1,6}\s+\w+/m,
      /^\*\*[^*]+\*\*/m,
      /^```/m,
      /^\s*-\s+\w+/m,
      /^\s*\d+\.\s+\w+/m,
      /\[[^\]]+\]\([^)]+\)/,
      /^>\s+\w+/m,
    ],
  },
];

export function detectLanguage(code: string): string {
  if (!code.trim()) {
    return "plaintext";
  }

  const trimmedCode = code.trim();

  if (trimmedCode.startsWith("{") || trimmedCode.startsWith("[")) {
    try {
      JSON.parse(trimmedCode);
      return "json";
    } catch {
      // Not valid JSON, continue detection
    }
  }

  if (trimmedCode.startsWith("<!DOCTYPE") || trimmedCode.startsWith("<html") || /<html[\s>]/i.test(trimmedCode)) {
    return "html";
  }

  if (/^#{1,6}\s+\w+/.test(trimmedCode) || /\[[^\]]+\]\([^)]+\)/.test(trimmedCode)) {
    return "markdown";
  }

  const scores: Map<string, number> = new Map();

  for (const { language, patterns } of LANGUAGE_PATTERNS) {
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(trimmedCode)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      scores.set(language, matchCount);
    }
  }

  if (scores.size === 0) {
    return "plaintext";
  }

  let bestLanguage = "plaintext";
  let bestScore = 0;

  for (const [language, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  return bestLanguage;
}
