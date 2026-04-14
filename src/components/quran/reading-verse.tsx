"use client";
import type { QcfVerse } from "@/types/quran-api";
import { VerseText } from "./verse-text";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReadingVerseProps {
  verse: QcfVerse;
  isFontLoaded: boolean;
  fontFamily: string;
  fontSize: string;
  showTranslation: boolean;
}

export function ReadingVerse({
  verse,
  isFontLoaded,
  fontFamily,
  fontSize,
  showTranslation,
}: ReadingVerseProps) {
  return (
    <div className="py-4 border-b border-[var(--text-alpha-06)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {verse.verse_key}
        </span>
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
          <div
            key={translation.id}
            className="mt-3 text-sm text-muted-foreground leading-relaxed"
          >
            <p className="text-xs font-medium text-muted-foreground/60 mb-1">
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
}
