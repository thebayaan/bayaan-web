"use client";
import { forwardRef } from "react";
import type { QcfVerse } from "@/types/quran-api";
import type { QcfFontResolver } from "./quran-word";
import { VerseText } from "./verse-text";
import { VerseActions } from "./verse-actions";
import { useHighlights, HIGHLIGHT_SWATCH } from "@/hooks/use-highlights";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReadingVerseProps {
  verse: QcfVerse;
  fontResolver: QcfFontResolver;
  fontSize: string;
  showTranslation: boolean;
  isTarget?: boolean;
  isPlaybackActive?: boolean;
  surahId: number;
  surahName: string;
}

export const ReadingVerse = forwardRef<HTMLDivElement, ReadingVerseProps>(function ReadingVerse(
  {
    verse,
    fontResolver,
    fontSize,
    showTranslation,
    isTarget = false,
    isPlaybackActive = false,
    surahId,
    surahName,
  },
  ref,
) {
  const { getHighlight } = useHighlights();
  const highlight = getHighlight(verse.verse_key);
  const highlightColor = highlight ? HIGHLIGHT_SWATCH[highlight.color] : null;

  return (
    <div
      ref={ref}
      id={verse.verse_key}
      aria-current={isTarget || isPlaybackActive ? "true" : undefined}
      className={`border-b border-[var(--text-alpha-06)] py-4 transition-colors ${
        isPlaybackActive
          ? "-mx-2 rounded-lg bg-[var(--brand-light)] px-2 ring-1 ring-[var(--brand-main)]/25"
          : isTarget
            ? "-mx-2 rounded-lg bg-[var(--text-alpha-06)] px-2"
            : ""
      }`}
      style={
        highlightColor
          ? {
              boxShadow: `inset 3px 0 0 ${highlightColor}`,
              paddingLeft: "0.75rem",
            }
          : undefined
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">{verse.verse_key}</span>
        <VerseActions verse={verse} surahId={surahId} surahName={surahName} />
      </div>
      <div className="mb-3">
        <VerseText
          words={verse.words}
          fontResolver={fontResolver}
          fontSize={fontSize}
          wordAudioEnabled
          playbackActiveVerseKey={isPlaybackActive ? verse.verse_key : null}
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
