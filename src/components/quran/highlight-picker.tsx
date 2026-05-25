"use client";

import { useState } from "react";
import { useHighlights, HIGHLIGHT_COLORS, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";

export function HighlightPicker({ verseKey, className }: { verseKey: string; className?: string }) {
  const { getHighlight, setHighlight, removeHighlight } = useHighlights();
  const current = getHighlight(verseKey);
  const [open, setOpen] = useState(false);

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
        onClick={() => setOpen((v) => !v)}
        aria-label={current ? `Change highlight on ${verseKey}` : `Highlight ${verseKey}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 21v-4l11-11 4 4-11 11H3zm14-13 3-3-4-4-3 3 4 4z" />
        </svg>
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
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="border-border bg-background absolute right-0 z-20 mt-1 flex gap-1 rounded-lg border p-1.5 shadow-lg"
          >
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                role="menuitem"
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
