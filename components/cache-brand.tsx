import Link from "next/link";
import { cn } from "@/lib/utils";

type CacheMarkProps = {
  className?: string;
};

type CacheBrandProps = {
  href: string;
  className?: string;
  onClick?: () => void;
  showDescriptor?: boolean;
};

export function CacheMark({ className }: CacheMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 shrink-0 text-primary", className)}
    >
      <g fill="none">
        <path d="M12 23V11L22 6V18L12 23Z" fill="currentColor" fillOpacity=".3" />
        <path d="M12 11V23" stroke="currentColor" />
        <path d="M22 6L12 11L2 6" stroke="currentColor" />
        <path d="M21.4472 5.72361L12.6708 1.33541C12.2485 1.12426 11.7515 1.12426 11.3292 1.33541L2.55279 5.72361C2.214 5.893 2 6.23926 2 6.61803V17.382C2 17.7607 2.214 18.107 2.55279 18.2764L11.3292 22.6646C11.7515 22.8757 12.2485 22.8757 12.6708 22.6646L21.4472 18.2764C21.786 18.107 22 17.7607 22 17.382V6.61803C22 6.23926 21.786 5.893 21.4472 5.72361Z" stroke="currentColor" />
      </g>
    </svg>
  );
}

export function CacheBrand({
  href,
  className,
  onClick,
  showDescriptor = true,
}: CacheBrandProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-none border border-transparent px-0 py-0 text-left transition-colors duration-150 ease-out hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label="Cache home"
    >
      <CacheMark />

      <span className="flex min-w-0 flex-col">
        <span className="text-[1rem] font-medium tracking-tight text-foreground">
          CACHE
        </span>
        {showDescriptor ? (
          <span className="text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            code library
          </span>
        ) : null}
      </span>
    </Link>
  );
}
