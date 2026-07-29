"use client";

import { cn } from "@/lib/utils";

interface IsometricIconProps {
  className?: string;
  size?: number;
}

export function ServerIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Server"
    >
      {/* Server rack - isometric style */}
      <path
        d="M4 8L12 4L20 8V16L12 20L4 16V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Top face */}
      <path
        d="M4 8L12 12L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Server indicators */}
      <circle cx="7" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="11.5" r="1" fill="currentColor" />
      <circle cx="13" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

export function LaptopIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Laptop"
    >
      {/* Laptop base */}
      <path
        d="M3 14L12 18.5L21 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M3 14V16L12 20.5L21 16V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Laptop screen */}
      <path
        d="M6 12L12 9L18 12V15L12 18L6 15V12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Screen content line */}
      <path
        d="M8 13L12 11L16 13"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function FileSearchIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="File search"
    >
      {/* Document base */}
      <path
        d="M6 6L14 2L18 4V14L10 18L6 16V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Document fold */}
      <path
        d="M14 2V6L18 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Search magnifying glass */}
      <circle
        cx="11"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 12L15.5 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Document lines */}
      <path
        d="M8 8H12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 10H10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ChatIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Chat"
    >
      {/* Chat bubble main shape */}
      <path
        d="M5 7L12 3.5L19 7V13L12 16.5L8 14.5V17L5 15.5V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Chat lines */}
      <path
        d="M8 9H16"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 11H14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkle/star for AI */}
      <path
        d="M17 16L18 18L20 18.5L18.5 20L19 22L17 21L15 22L15.5 20L14 18.5L16 18L17 16Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function FolderAddIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Add folder"
    >
      {/* Folder base */}
      <path
        d="M4 9L12 5L20 9V15L12 19L4 15V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Folder tab */}
      <path
        d="M4 9L8 7L12 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Add symbol */}
      <path
        d="M12 11V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 13H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function CloudUploadIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Cloud upload"
    >
      {/* Cloud body */}
      <path
        d="M6 12C4 12 3 11 3 9.5C3 8 4 7 6 7C6 5 7.5 3.5 10 3.5C12 3.5 13.5 4.5 14 6C15.5 5.5 17 6.5 17 8C19 8 20 9 20 10.5C20 12 19 13 17 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Upload arrow */}
      <path
        d="M12 16V20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 18L12 16L14 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Isometric depth lines */}
      <path
        d="M8 14L12 16L16 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function GearIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Settings"
    >
      {/* Gear outer shape - isometric style */}
      <path
        d="M12 3L14 5.5L17 5L18 8L21 9L20 12L21 15L18 16L17 19L14 18.5L12 21L10 18.5L7 19L6 16L3 15L4 12L3 9L6 8L7 5L10 5.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner circle */}
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function HeartIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Favorite"
    >
      {/* Heart shape - isometric style */}
      <path
        d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6 4.5 9 4.5C10.5 4.5 11.5 5.2 12 6C12.5 5.2 13.5 4.5 15 4.5C18 4.5 20 6.5 20 9.5C20 15.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Isometric depth */}
      <path
        d="M6 9L12 12L18 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LockIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Lock"
    >
      {/* Lock body */}
      <path
        d="M6 11L12 8L18 11V17L12 20L6 17V11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lock shackle */}
      <path
        d="M8 11V8C8 6 9 4 12 4C15 4 16 6 16 8V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Keyhole */}
      <circle
        cx="12"
        cy="14"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 15.5V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ShieldIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Shield"
    >
      {/* Shield outline */}
      <path
        d="M12 3L20 7V12C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 12V7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Checkmark */}
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Isometric depth */}
      <path
        d="M4 7L12 11L20 7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BrowserIcon({ className, size = 24 }: IsometricIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-label="Browser"
    >
      {/* Browser window frame */}
      <path
        d="M4 6L12 2L20 6V16L12 20L4 16V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Title bar */}
      <path
        d="M4 6L12 10L20 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Window controls */}
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="10" cy="8.5" r="1" fill="currentColor" />
      <circle cx="13" cy="10" r="1" fill="currentColor" />
      {/* Content lines */}
      <path
        d="M7 12H17"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7 14H14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
