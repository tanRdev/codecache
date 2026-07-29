"use client";

import { Suspense, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleNotch, MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  className?: string;
}

const SEARCH_NAVIGATION_DELAY_MS = 180;

export function SearchInput({ className }: SearchInputProps) {
  return (
    <Suspense fallback={<div className={cn("h-9 rounded-lg border border-border-subtle bg-surface-primary", className)} />}>
      <SearchInputSuspenseBoundary className={className} />
    </Suspense>
  );
}

function SearchInputSuspenseBoundary({ className }: SearchInputProps) {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  return <SearchInputInner key={currentQuery} className={className} currentQuery={currentQuery} />;
}

interface SearchInputInnerProps {
  className?: string;
  currentQuery: string;
}

function SearchInputInner({ className, currentQuery }: SearchInputInnerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(currentQuery);

  const scheduleSearch = (nextValue: string) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      if (!inputRef.current) {
        return;
      }

      const params = new URLSearchParams(searchParams);

      if (nextValue.trim()) {
        params.set("q", nextValue);
      } else {
        params.delete("q");
      }

      params.delete("page");

      startTransition(() => {
        const nextQueryString = params.toString();
        router.replace(nextQueryString ? `/dashboard?${nextQueryString}` : "/dashboard");
      });
    }, SEARCH_NAVIGATION_DELAY_MS);
  };

  const clearSearch = () => {
    setValue("");
    scheduleSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center border border-border-subtle bg-surface-primary transition-colors duration-100 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 rounded-lg">
        <MagnifyingGlass
          aria-hidden="true"
          className="pointer-events-none ml-3 size-3.5 shrink-0 text-text-tertiary"
        />
        <input
          type="search"
          ref={inputRef}
          name="q"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            scheduleSearch(nextValue);
          }}
          placeholder="Search snippets..."
          aria-label="Search snippets"
          className="h-9 w-full bg-transparent py-2 pl-2 pr-8 text-[13px] text-foreground outline-none placeholder:text-text-tertiary [appearance:textfield] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="text-text-tertiary transition-colors duration-100 hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}

          {isPending && (
            <span role="status" aria-label="Searching">
              <CircleNotch className="size-3 animate-spin text-primary" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
