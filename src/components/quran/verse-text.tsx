import type { QcfWord } from "@/types/quran-api";
import { QuranWord } from "./quran-word";
import { cn } from "@/lib/utils";

interface VerseTextProps {
  words: QcfWord[];
  isFontLoaded: boolean;
  fontFamily: string;
  mushafMode?: boolean;
  fontSize?: string;
  className?: string;
  /** Pass through to each QuranWord — click-to-select in mushaf view. */
  selectable?: boolean;
}

export function VerseText({
  words,
  isFontLoaded,
  fontFamily,
  mushafMode,
  fontSize = "1.8rem",
  className,
  selectable,
}: VerseTextProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        "flex flex-wrap leading-loose",
        mushafMode ? "justify-between" : "justify-start gap-x-1",
        className,
      )}
      style={{ fontSize }}
    >
      {words.map((word) => (
        <QuranWord
          key={`${word.verse_key}-${word.position}`}
          word={word}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
          selectable={selectable}
        />
      ))}
    </div>
  );
}
