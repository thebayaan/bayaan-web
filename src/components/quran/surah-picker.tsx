"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import {
  type MushafSearchResult,
  navigateToMushafPage,
  parseMushafSearchQuery,
} from "@/lib/mushaf-navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const surahs = surahData as unknown as Surah[];

const DEFAULT_RESULTS: MushafSearchResult[] = surahs.map((surah) => ({
  type: "surah",
  surah,
  title: surah.name,
  subtitle: `Surah ${surah.id} · ${surah.translated_name_english}`,
  href: `/quran/${surah.id}`,
}));

interface SurahPickerProps {
  surah: Surah;
}

export function SurahPicker({ surah }: SurahPickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const trigger = (
    <ChipButton
      ref={triggerRef}
      surah={surah}
      open={open}
      onClick={() => setOpen((prev) => !prev)}
    />
  );

  return (
    <>
      {trigger}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="p-0">
            <PickerContent currentSurahId={surah.id} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Portal>
            <Popover.Positioner
              anchor={triggerRef}
              sideOffset={8}
              side="bottom"
              align="start"
              className="z-50"
            >
              <Popover.Popup
                initialFocus={false}
                className="border-border bg-background w-[min(420px,calc(100vw-1rem))] overflow-hidden rounded-2xl border shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
              >
                <PickerContent currentSurahId={surah.id} onClose={() => setOpen(false)} />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </>
  );
}

interface ChipButtonProps {
  surah: Surah;
  open: boolean;
  onClick: () => void;
}

const ChipButton = function ChipButton({
  ref,
  surah,
  open,
  onClick,
}: ChipButtonProps & { ref?: React.Ref<HTMLButtonElement> }): React.JSX.Element {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`Change surah (current: ${surah.name})`}
      className="border-border bg-surface hover:bg-surface-raised duration-fast ease-standard flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors"
    >
      <span className="bg-brand-light text-brand-main flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-bold tabular-nums">
        {String(surah.id).padStart(2, "0")}
      </span>
      <span className="flex flex-col items-start">
        <span className="text-foreground text-sm leading-none font-bold">{surah.name}</span>
        <span className="text-muted-foreground mt-0.5 text-[11px] leading-none font-medium">
          {surah.translated_name_english} · {surah.verses_count} ayahs
        </span>
      </span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground ml-1"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};

interface PickerContentProps {
  currentSurahId: number;
  onClose: () => void;
}

function PickerContent({ currentSurahId, onClose }: PickerContentProps): React.JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo<MushafSearchResult[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) return DEFAULT_RESULTS;
    return parseMushafSearchQuery(trimmed);
  }, [query]);

  function handleQueryChange(value: string): void {
    setQuery(value);
    setActiveIndex(0);
  }

  // Focus the search input on mount.
  useEffect(() => {
    const handle = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(handle);
  }, []);

  // On open with no query, scroll the current surah into view so the
  // user can see where they are in the full list.
  useLayoutEffect(() => {
    if (query.trim()) return;
    const target = listRef.current?.querySelector<HTMLElement>(
      `[data-surah-id="${currentSurahId}"]`,
    );
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "center" });
    }
  }, [query, currentSurahId]);

  function navigate(result: MushafSearchResult): void {
    switch (result.type) {
      case "surah":
        router.push(`/quran/${result.surah.id}`);
        break;
      case "verse":
        router.push(`/quran/${result.surahId}/${result.ayah}`);
        break;
      case "page":
      case "juz": {
        navigateToMushafPage(result.page, router);
        break;
      }
    }
    onClose();
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
      const target = results[activeIndex];
      if (target) navigate(target);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-[var(--text-alpha-06)] px-4">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded
          aria-controls="surah-picker-list"
          aria-activedescendant={
            results[activeIndex] ? `surah-picker-row-${activeIndex}` : undefined
          }
          placeholder="Surah, page, juz, or 2:255…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
        />
      </div>
      <ul
        id="surah-picker-list"
        ref={listRef}
        role="listbox"
        className="max-h-[60vh] overflow-y-auto py-1"
      >
        {results.length === 0 ? (
          <li className="text-muted-foreground px-4 py-6 text-center text-sm">No matches</li>
        ) : (
          results.map((result, i) => (
            <ResultRow
              key={resultKey(result)}
              id={`surah-picker-row-${i}`}
              result={result}
              active={i === activeIndex}
              isCurrent={result.type === "surah" && result.surah.id === currentSurahId}
              onHover={() => setActiveIndex(i)}
              onSelect={() => navigate(result)}
            />
          ))
        )}
      </ul>
      <div className="text-muted-foreground hidden justify-between border-t border-[var(--text-alpha-06)] px-4 py-2 text-[11px] sm:flex">
        <span>↵ to go · ↑↓ to move</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}

interface ResultRowProps {
  id: string;
  result: MushafSearchResult;
  active: boolean;
  isCurrent: boolean;
  onHover: () => void;
  onSelect: () => void;
}

function ResultRow({
  id,
  result,
  active,
  isCurrent,
  onHover,
  onSelect,
}: ResultRowProps): React.JSX.Element {
  const dataSurahId = result.type === "surah" ? result.surah.id : undefined;
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      aria-current={isCurrent ? "true" : undefined}
      data-surah-id={dataSurahId}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors ${
        active ? "bg-[var(--text-alpha-06)]" : ""
      }`}
    >
      <span className="text-muted-foreground w-12 shrink-0 text-[10px] font-medium tracking-wider uppercase">
        {KIND_LABEL[result.type]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{result.title}</span>
          {isCurrent ? (
            <span className="bg-brand-light text-brand-main rounded px-1.5 py-0.5 text-[10px] font-semibold">
              Current
            </span>
          ) : null}
        </span>
        {result.subtitle ? (
          <span className="text-muted-foreground block truncate text-xs">{result.subtitle}</span>
        ) : null}
      </span>
    </li>
  );
}

const KIND_LABEL: Record<MushafSearchResult["type"], string> = {
  surah: "Surah",
  page: "Page",
  juz: "Juz",
  verse: "Verse",
};

function resultKey(result: MushafSearchResult): string {
  switch (result.type) {
    case "surah":
      return `surah:${result.surah.id}`;
    case "page":
      return `page:${result.page}`;
    case "juz":
      return `juz:${result.juz}`;
    case "verse":
      return `verse:${result.surahId}:${result.ayah}`;
  }
}

const MOBILE_QUERY = "(max-width: 639px)";

function subscribeMobile(callback: () => void): () => void {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}
