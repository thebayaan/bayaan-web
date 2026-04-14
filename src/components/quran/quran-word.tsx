import type { QcfWord } from "@/types/quran-api";
import { cn } from "@/lib/utils";

interface QuranWordProps {
  word: QcfWord;
  isFontLoaded: boolean;
  fontFamily: string;
  className?: string;
}

export function QuranWord({
  word,
  isFontLoaded,
  fontFamily,
  className,
}: QuranWordProps) {
  const text = isFontLoaded ? word.code_v2 : word.qpc_uthmani_hafs;
  return (
    <span
      className={cn(
        "inline-block cursor-pointer transition-colors hover:text-blue-400/80",
        !isFontLoaded && "font-[UthmanicHafs]",
        className,
      )}
      style={isFontLoaded ? { fontFamily } : undefined}
      data-verse-key={word.verse_key}
      data-word-position={word.position}
    >
      {text}
    </span>
  );
}
