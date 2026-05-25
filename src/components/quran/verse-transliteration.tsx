"use client";

import { useEffect, useState } from "react";
import { getVerseTransliteration } from "@/lib/transliteration";
import { sanitizeHtml } from "@/lib/sanitize";

interface VerseTransliterationProps {
  verseKey: string;
}

export function VerseTransliteration({ verseKey }: VerseTransliterationProps) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getVerseTransliteration(verseKey).then((value) => {
      if (!cancelled) setText(value);
    });
    return () => {
      cancelled = true;
    };
  }, [verseKey]);

  if (!text) return null;

  return (
    <p
      className="text-muted-foreground mt-2 text-sm leading-relaxed italic"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
    />
  );
}
