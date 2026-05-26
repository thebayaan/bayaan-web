"use client";

import { useEffect, useRef, useState } from "react";
import { useHighlights, HIGHLIGHT_COLORS, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";
import { useMenuKeyboardNav } from "@/hooks/use-menu-keyboard-nav";
import { HighlightIcon } from "@/components/icons";

export function HighlightPicker({ verseKey, className }: { verseKey: string; className?: string }) {
  const { getHighlight, setHighlight, removeHighlight } = useHighlights();
  const current = getHighlight(verseKey);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleMenuKey = useMenuKeyboardNav();

  // Close on Escape; return focus to the trigger.
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // ARIA APG: move focus to the first menuitem on open.
  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])');
    first?.focus();
  }, [open]);

  async function pick(color: (typeof HIGHLIGHT_COLORS)[number] | null): Promise<void> {
    setOpen(false);
    if (color === null) {
      await removeHighlight(verseKey);
    } else {
      await setHighlight(verseKey, color);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={current ? `Change highlight on ${verseKey}` : `Highlight ${verseKey}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        <HighlightIcon size={14} aria-hidden="true" />
        {current ? (
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: HIGHLIGHT_SWATCH[current.color] }}
          />
        ) : null}
      </button>
      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Highlight colour for ${verseKey}`}
            onKeyDown={handleMenuKey}
            className="border-border bg-background absolute right-0 z-20 mt-1 flex gap-1 rounded-lg border p-1.5 shadow-lg"
          >
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                role="menuitem"
                type="button"
                onClick={() => void pick(color)}
                aria-label={`${color} highlight${current?.color === color ? " (current)" : ""}`}
                aria-pressed={current?.color === color}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  current?.color === color ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: HIGHLIGHT_SWATCH[color] }}
              />
            ))}
            {current ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => void pick(null)}
                aria-label="Remove highlight"
                className="hover:bg-muted ml-1 rounded-full px-2 text-xs"
              >
                Clear
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
