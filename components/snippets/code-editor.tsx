"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { getMonacoLanguage } from "./snippet-config";

const editorBackground = "#0A0A0B";
const editorSurface = "#171719";
const editorLineHighlight = "#202023";
const editorBorder = "rgba(255,255,255,0.12)";
const editorSecondaryText = "#CACACE";
const editorTertiaryText = "#8E8E96";
const editorAccent = "#E8FF65";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center bg-background">
      <span className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">
        Loading editor...
      </span>
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: number | string;
}

interface MonacoThemeApi {
  editor: {
    defineTheme: (
      themeName: string,
      themeDefinition: {
        base: string;
        inherit: boolean;
        rules: Array<{ token: string; foreground: string; fontStyle?: string }>;
        colors: Record<string, string>;
      },
    ) => void;
  };
}

export function CodeEditor({
  value,
  onChange,
  language,
  className,
  placeholder,
  readOnly = false,
  height = 400,
}: CodeEditorProps) {
  const monacoLanguage = getMonacoLanguage(language);

  return (
    <section
      aria-label="Code editor"
      className={cn("overflow-hidden", className)}
    >
      <MonacoEditor
        beforeMount={defineOpusMonacoTheme}
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        theme="opus-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 18, bottom: 18 },
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          readOnly,
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveIndentation: true,
          },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderWhitespace: "selection",
          placeholder,
        }}
      />
    </section>
  );
}

export function defineOpusMonacoTheme(monaco: MonacoThemeApi) {
  monaco.editor.defineTheme("opus-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8E8E96", fontStyle: "italic" },
      { token: "keyword", foreground: "E8FF65" },
      { token: "string", foreground: "A7D7C5" },
      { token: "number", foreground: "D6C98F" },
        { token: "type", foreground: "D4D4D8" },
    ],
    colors: {
      "editor.background": editorBackground,
      "editor.foreground": "#FAFAFA",
      "editorLineNumber.foreground": "#5E5E5E",
      "editorLineNumber.activeForeground": editorSecondaryText,
      "editor.lineHighlightBackground": editorLineHighlight,
      "editorLineNumber.dimmedForeground": editorTertiaryText,
      "editorIndentGuide.background1": "rgba(255,255,255,0.05)",
      "editorIndentGuide.activeBackground1": "rgba(255,255,255,0.10)",
      "editor.selectionBackground": "rgba(232,255,101,0.16)",
      "editor.inactiveSelectionBackground": "rgba(255,255,255,0.10)",
      "editorCursor.foreground": editorAccent,
      "editorWhitespace.foreground": "rgba(255,255,255,0.07)",
      "editorWidget.background": editorSurface,
      "editorWidget.border": editorBorder,
      "editorSuggestWidget.background": editorSurface,
      "editorSuggestWidget.border": editorBorder,
      "editorSuggestWidget.selectedBackground": "rgba(232,255,101,0.16)",
      "editorHoverWidget.background": editorSurface,
      "editorHoverWidget.border": editorBorder,
      "scrollbarSlider.background": "rgba(255,255,255,0.10)",
      "scrollbarSlider.hoverBackground": "rgba(255,255,255,0.16)",
      "scrollbarSlider.activeBackground": "rgba(255,255,255,0.20)",
      "minimap.background": editorBackground,
    },
  });
}
