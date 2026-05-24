import type { QcfWord } from "@/types/quran-api";
import { QuranWord, type QcfFontResolver } from "./quran-word";
import { cn } from "@/lib/utils";

interface VerseTextProps {
  words: QcfWord[];
  fontResolver: QcfFontResolver;
  mushafMode?: boolean;
  fontSize?: string;
  className?: string;
  /** Pass through to each QuranWord — click-to-select in mushaf view. */
  selectable?: boolean;
}

export function VerseText({
  words,
  fontResolver,
  mushafMode,
  fontSize = "1.8rem",
  className,
  selectable,
}: VerseTextProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        "leading-[2.2]",
        mushafMode ? "text-center" : "flex flex-wrap justify-start gap-x-1 leading-loose",
        className,
      )}
      style={{ fontSize }}
    >
      {words.map((word) => (
        <QuranWord
          key={`${word.verse_key}-${word.position}`}
          word={word}
          fontResolver={fontResolver}
          selectable={selectable}
          className={mushafMode ? "mx-[0.12em] inline-block align-middle" : undefined}
        />
      ))}
    </div>
  );
}
