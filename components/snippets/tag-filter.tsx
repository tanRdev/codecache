"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cache-tags-expanded";
const GAP_PX = 6; // gap-1.5 = 6px

interface TagFilterProps {
  tags: string[];
  className?: string;
}

export function TagFilter({ tags, className }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <Suspense fallback={<div className={cn("h-7", className)} />}>
      <TagFilterInner tags={tags} className={className} />
    </Suspense>
  );
}

function TagFilterInner({ tags, className }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored !== null) {
        setIsExpanded(stored === "true");
      }

      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Calculate how many tags fit on one line
  const calculateVisibleCount = useCallback(() => {
    if (!containerRef.current || tagRefs.current.length === 0) {
      setVisibleCount(tags.length);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    let totalWidth = 0;
    let count = 0;

    // Reserve space for expand button if needed (approx 50px)
    const needsExpandButton = tags.length > 1;
    const reservedWidth = needsExpandButton ? 50 : 0;

    for (let i = 0; i < tagRefs.current.length; i++) {
      const tagEl = tagRefs.current[i];
      if (!tagEl) continue;

      const tagWidth = tagEl.offsetWidth;

      if (totalWidth + tagWidth + (count > 0 ? GAP_PX : 0) + (i < tags.length - 1 ? reservedWidth : 0) <= containerWidth) {
        totalWidth += tagWidth + (count > 0 ? GAP_PX : 0);
        count++;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(1, count));
  }, [tags.length]);

  // Recalculate on resize and when tags change
  useEffect(() => {
    let frame = window.requestAnimationFrame(() => {
      calculateVisibleCount();
    });

    const handleResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        calculateVisibleCount();
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateVisibleCount]);

  // Recalculate after hydration when refs are set
  useEffect(() => {
    if (isHydrated) {
      const frame = window.requestAnimationFrame(() => {
        calculateVisibleCount();
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [isHydrated, calculateVisibleCount]);

  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const selectedTagSet = new Set(selectedTags);

  const pushParams = (params: URLSearchParams) => {
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : "/dashboard");
  };

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const nextTags = selectedTagSet.has(tag)
      ? selectedTags.filter((currentTag) => currentTag !== tag)
      : [...selectedTags, tag];

    if (nextTags.length > 0) {
      params.set("tags", nextTags.join(","));
    } else {
      params.delete("tags");
    }

    pushParams(params);
  };

  const toggleExpanded = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    localStorage.setItem(STORAGE_KEY, String(nextExpanded));
  };

  const hasMoreTags = tags.length > visibleCount;
  const hiddenCount = tags.length - visibleCount;
  const displayTags = isExpanded ? tags : tags.slice(0, visibleCount);

  return (
    <div ref={containerRef} className={cn("relative flex flex-wrap items-center gap-1.5", className)}>
      {displayTags.map((tag, index) => {
        const isSelected = selectedTagSet.has(tag);

        return (
          <button
            key={tag}
            ref={(el) => {
              tagRefs.current[index] = el;
            }}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleTag(tag)}
            className={cn(
              "border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] transition-colors duration-100 rounded",
              isSelected
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border-subtle bg-transparent text-text-tertiary hover:border-border-strong hover:text-text-secondary",
            )}
          >
            {tag}
          </button>
        );
      })}

      {/* Hidden tags for measuring their widths during SSR/hydration */}
      {!isExpanded && (
        <div className="pointer-events-none absolute opacity-0" aria-hidden="true">
          {tags.slice(visibleCount).map((tag, index) => (
            <button
              key={`measure-${tag}`}
              ref={(el) => {
                tagRefs.current[visibleCount + index] = el;
              }}
              type="button"
              tabIndex={-1}
              className="border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] rounded"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {hasMoreTags && (
        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex items-center gap-0.5 border border-border-subtle bg-transparent px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-text-tertiary transition-colors duration-100 rounded hover:border-border-strong hover:text-text-secondary"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-3" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="size-3" />
              +{hiddenCount}
            </>
          )}
        </button>
      )}
    </div>
  );
}
