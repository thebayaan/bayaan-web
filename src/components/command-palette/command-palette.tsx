"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useReciters } from "@/hooks/use-reciters";
import { getCategories } from "@/data/adhkar-data";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { parseMushafSearchQuery } from "@/lib/mushaf-navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type CommandKind = "surah" | "reciter" | "adhkar" | "verse" | "page" | "juz" | "mushaf-verse";

interface Command {
  kind: CommandKind;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string;
}

const VERSE_REFERENCE = /^(\d{1,3})\s*:\s*(\d{1,3})$/;

function parseVerseReference(query: string): Command | null {
  const match = query.match(VERSE_REFERENCE);
  if (!match) return null;
  const surahId = Number(match[1]);
  const ayahId = Number(match[2]);
  if (surahId < 1 || surahId > 114) return null;
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) return null;
  if (ayahId < 1 || ayahId > surah.verses_count) return null;
  return {
    kind: "verse",
    id: `verse:${surahId}:${ayahId}`,
    title: `Surah ${surah.name} · Verse ${ayahId}`,
    subtitle: `${surah.translated_name_english} · ${surahId}:${ayahId}`,
    href: `/quran/${surahId}/${ayahId}`,
    keywords: `${surahId}:${ayahId} ${surah.name}`,
  };
}

const surahs = surahData as unknown as Surah[];

const ADHKAR = getCategories().map<Command>((cat) => ({
  kind: "adhkar",
  id: `adhkar:${cat.id}`,
  title: cat.title,
  subtitle: `${cat.dhikrCount} ${cat.dhikrCount === 1 ? "dhikr" : "adhkar"}`,
  href: `/adhkar/${cat.id}`,
  keywords: `${cat.title} ${cat.tags.join(" ")}`,
}));

const SURAH_COMMANDS = surahs.map<Command>((s) => ({
  kind: "surah",
  id: `surah:${s.id}`,
  title: `Surah ${s.name}`,
  subtitle: `${s.translated_name_english} · ${s.verses_count} verses`,
  href: `/quran/${s.id}`,
  keywords: `${s.id} ${s.name} ${s.name_arabic} ${s.translated_name_english}`,
}));

const KIND_LABEL: Record<CommandKind, string> = {
  surah: "Surah",
  reciter: "Reciter",
  adhkar: "Adhkar",
  verse: "Verse",
  page: "Page",
  juz: "Juz",
  "mushaf-verse": "Verse",
};

export function CommandPalette() {
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const router = useRouter();
  const { reciters } = useReciters();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const reciterCommands: Command[] = reciters.map((r) => ({
      kind: "reciter",
      id: `reciter:${r.id}`,
      title: r.name,
      subtitle: r.name_arabic,
      href: `/reciter/${r.slug}`,
      keywords: `${r.name} ${r.name_arabic ?? ""}`,
    }));
    return [...SURAH_COMMANDS, ...reciterCommands, ...ADHKAR];
  }, [reciters]);

  const fuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: ["title", "subtitle", "keywords"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [commands],
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return commands.slice(0, 20);

    const mushafResults = parseMushafSearchQuery(trimmed).map<Command>((result) => ({
      kind:
        result.type === "page"
          ? "page"
          : result.type === "juz"
            ? "juz"
            : result.type === "verse"
              ? "mushaf-verse"
              : "surah",
      id: `${result.type}:${result.href}`,
      title: result.title,
      subtitle: result.subtitle,
      href: result.href,
      keywords: result.title,
    }));

    const fuseResults = fuse
      .search(trimmed)
      .slice(0, 30)
      .map((r) => r.item);
    const verseCommand = parseVerseReference(trimmed);
    const base = verseCommand ? [verseCommand, ...fuseResults] : fuseResults;
    return mushafResults.length > 0 ? [...mushafResults, ...base] : base;
  }, [query, fuse, commands]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function handleOpenChange(next: boolean): void {
    if (next) {
      setQuery("");
      setActiveIndex(0);
    }
    setOpen(next);
  }

  function handleQueryChange(value: string): void {
    setQuery(value);
    setActiveIndex(0);
  }

  function selectAt(index: number): void {
    const command = results[index];
    if (!command) return;
    router.push(command.href);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectAt(activeIndex);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <div className="border-b border-[var(--text-alpha-06)] px-4">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="command-palette-list"
            aria-activedescendant={
              results[activeIndex] ? `command-${results[activeIndex]!.id}` : undefined
            }
            placeholder="Search surahs, pages, juz, verses…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <ul id="command-palette-list" role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="text-muted-foreground px-4 py-6 text-center text-sm">No matches</li>
          ) : (
            results.map((cmd, i) => (
              <li
                key={cmd.id}
                id={`command-${cmd.id}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectAt(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  i === activeIndex ? "bg-[var(--text-alpha-06)]" : ""
                }`}
              >
                <span className="text-muted-foreground w-14 shrink-0 text-[10px] font-medium tracking-wider uppercase">
                  {KIND_LABEL[cmd.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{cmd.title}</span>
                  {cmd.subtitle ? (
                    <span className="text-muted-foreground block truncate text-xs">
                      {cmd.subtitle}
                    </span>
                  ) : null}
                </span>
              </li>
            ))
          )}
        </ul>
        <div className="text-muted-foreground flex justify-between border-t border-[var(--text-alpha-06)] px-4 py-2 text-[11px]">
          <span>↵ to go · ↑↓ to move</span>
          <span>Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
