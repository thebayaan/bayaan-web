"use client";

import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import { useEffect, useRef, type InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  className?: string;
  /** Show the Cmd+K shortcut hint */
  showShortcut?: boolean;
  onShortcutPress?: () => void;
}

/**
 * SearchInput — full search bar with Cmd+K shortcut registration.
 *
 * Usage:
 *   <SearchInput placeholder="Search surahs..." showShortcut />
 *   <SearchInput onShortcutPress={() => openModal()} />
 */
export function SearchInput({
  className,
  showShortcut = true,
  onShortcutPress,
  ...props
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (onShortcutPress) {
          onShortcutPress();
        } else {
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onShortcutPress]);

  return (
    <div
      className={cn(
        "relative flex items-center",
        "rounded-xl border",
        "transition-all duration-150",
        "focus-within:ring-1 focus-within:ring-[var(--color-text)]",
        className,
      )}
      style={{
        backgroundColor: "var(--color-card-bg)",
        borderColor: "var(--color-card-border)",
      }}
    >
      {/* Search icon */}
      <Search
        size={15}
        className="absolute left-3 pointer-events-none"
        style={{ color: "var(--color-icon)" }}
        aria-hidden="true"
      />

      {/* Input */}
      <input
        ref={inputRef}
        type="search"
        className={cn(
          "w-full h-9 pl-9 pr-3 bg-transparent",
          "text-sm font-medium placeholder:font-normal",
          "focus:outline-none",
          showShortcut && "pr-16",
        )}
        style={{
          color: "var(--color-label)",
          // placeholder color via CSS
        }}
        {...props}
      />

      {/* Cmd+K hint */}
      {showShortcut && (
        <kbd
          className={cn(
            "absolute right-2.5 flex items-center gap-0.5",
            "text-[10px] font-medium",
            "px-1.5 py-0.5 rounded-md border",
            "pointer-events-none select-none",
          )}
          style={{
            color: "var(--color-hint)",
            borderColor: "var(--color-card-border)",
            backgroundColor: "var(--color-secondary-bg)",
          }}
          aria-label="Press Command K to search"
        >
          <span>⌘</span>
          <span>K</span>
        </kbd>
      )}

      <style>{`
        input[type="search"]::-webkit-search-cancel-button {
          display: none;
        }
        input[type="search"]::placeholder {
          color: var(--color-hint);
        }
      `}</style>
    </div>
  );
}
