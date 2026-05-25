"use client";

import { useState } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface BookmarkToggleProps {
  verseKey: string;
  className?: string;
}

export function BookmarkToggle({ verseKey, className }: BookmarkToggleProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [pending, setPending] = useState(false);
  const bookmarked = isBookmarked(verseKey);

  const [surahStr, ayahStr] = verseKey.split(":");
  const surahNumber = Number(surahStr);
  const ayahNumber = Number(ayahStr);

  async function handleClick(): Promise<void> {
    if (pending) return;
    setPending(true);
    try {
      await toggleBookmark({
        verse_key: verseKey,
        surah_number: surahNumber,
        ayah_number: ayahNumber,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={() => void handleClick()}
      aria-label={bookmarked ? `Remove bookmark from ${verseKey}` : `Bookmark ${verseKey}`}
      aria-pressed={bookmarked}
      disabled={pending}
      className={className}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={bookmarked ? 0 : 2}
        aria-hidden="true"
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}
