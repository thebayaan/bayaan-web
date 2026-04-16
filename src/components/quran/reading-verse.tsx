"use client";
import { forwardRef } from "react";
import type { QcfVerse } from "@/types/quran-api";
import { VerseText } from "./verse-text";
import { BookmarkToggle } from "./bookmark-toggle";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReadingVerseProps {
  verse: QcfVerse;
  isFontLoaded: boolean;
  fontFamily: string;
  fontSize: string;
  showTranslation: boolean;
  isTarget?: boolean;
}

export const ReadingVerse = forwardRef<HTMLDivElement, ReadingVerseProps>(function ReadingVerse(
  { verse, isFontLoaded, fontFamily, fontSize, showTranslation, isTarget = false },
  ref,
) {
  return (
    <div
      ref={ref}
      id={verse.verse_key}
      aria-current={isTarget ? "true" : undefined}
      className={`border-b border-[var(--text-alpha-06)] py-4 transition-colors ${
        isTarget ? "-mx-2 rounded-lg bg-[var(--text-alpha-06)] px-2" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">{verse.verse_key}</span>
        <BookmarkToggle
          verseKey={verse.verse_key}
          className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors hover:bg-[var(--text-alpha-06)]"
        />
      </div>
      <div className="mb-3">
        <VerseText
          words={verse.words}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      </div>
      {showTranslation &&
        verse.translations?.map((translation) => (
          <div key={translation.id} className="text-muted-foreground mt-3 text-sm leading-relaxed">
            <p className="text-muted-foreground/60 mb-1 text-xs font-medium">
              {translation.resource_name}
            </p>
            <p
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(translation.text),
              }}
            />
          </div>
        ))}
    </div>
  );
});
