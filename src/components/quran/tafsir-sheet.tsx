"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { useTafsir } from "@/hooks/use-tafsir";
import { AVAILABLE_TAFASEER } from "@/data/available-tafaseer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sanitizeHtml } from "@/lib/sanitize";

interface TafsirSheetProps {
  verseKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TafsirSheet({ verseKey, open, onOpenChange }: TafsirSheetProps) {
  const tafsirId = useReadingSettingsStore((s) => s.tafsirId);
  const setTafsirId = useReadingSettingsStore((s) => s.setTafsirId);
  const { text, isLoading } = useTafsir(open ? verseKey : null, tafsirId);
  const edition = AVAILABLE_TAFASEER.find((entry) => entry.id === tafsirId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface flex w-full max-w-lg flex-col">
        <SheetHeader>
          <SheetTitle>Tafsir {verseKey ? `· ${verseKey}` : ""}</SheetTitle>
          <SheetDescription>
            {edition ? `${edition.name}${edition.authorName ? ` · ${edition.authorName}` : ""}` : "Commentary"}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-4">
          <label className="text-foreground mb-2 block text-sm font-semibold">Edition</label>
          <select
            value={tafsirId}
            onChange={(event) => setTafsirId(event.target.value)}
            className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
            aria-label="Tafsir edition"
          >
            {AVAILABLE_TAFASEER.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} ({entry.language})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading tafsir…</p>
          ) : text ? (
            <div
              dir={edition?.direction ?? "ltr"}
              className="prose prose-sm text-foreground max-w-none leading-relaxed [&_h1]:text-base [&_h2]:text-sm [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">No tafsir available for this verse.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
