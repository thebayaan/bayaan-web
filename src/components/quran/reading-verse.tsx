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
    <div className="border-b border-[var(--text-alpha-06)] py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">{verse.verse_key}</span>
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
}
