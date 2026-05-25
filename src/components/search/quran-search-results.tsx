"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  navigateToMushafPage,
  parseMushafSearchQuery,
  type MushafSearchResult,
} from "@/lib/mushaf-navigation";
import { useQuranTextSearch } from "@/hooks/use-quran-text-search";

interface QuranSearchResultsProps {
  query: string;
}

export function QuranSearchResults({ query }: QuranSearchResultsProps) {
  const mushafResults = useMemo(() => parseMushafSearchQuery(query), [query]);
  const { results: textResults, isLoading: textLoading } = useQuranTextSearch(query);

  if (mushafResults.length > 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Mushaf navigation
        </h2>
        {mushafResults.map((result) => (
          <MushafSearchResultRow key={`${result.type}-${result.href}`} result={result} />
        ))}
      </section>
    );
  }

  if (query.trim().length >= 3) {
    return (
      <section className="space-y-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Quran text
        </h2>
        {textLoading ? (
          <p className="text-muted-foreground text-sm">Searching translations…</p>
        ) : textResults.length === 0 ? (
          <p className="text-muted-foreground text-sm">No matching verses found.</p>
        ) : (
          textResults.map((hit) => {
            const [surahId, ayah] = hit.verse_key.split(":");
            return (
              <Link
                key={hit.verse_key}
                href={`/quran/${surahId}/${ayah}`}
                className="block rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
              >
                <p className="text-sm font-medium">{hit.verse_key}</p>
                <p
                  className="text-muted-foreground mt-1 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: hit.translations[0]?.text ?? hit.highlighted ?? hit.text,
                  }}
                />
              </Link>
            );
          })
        )}
      </section>
    );
  }

  return null;
}

function MushafSearchResultRow({ result }: { result: MushafSearchResult }) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    if (result.type !== "page" && result.type !== "juz") return;
    event.preventDefault();
    navigateToMushafPage(result.page, router);
  }

  return (
    <Link
      href={result.href}
      onClick={handleClick}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-xs font-semibold uppercase">
        {result.type === "page"
          ? "Pg"
          : result.type === "juz"
            ? "Jz"
            : result.type === "verse"
              ? "Ay"
              : "Su"}
      </div>
      <div>
        <p className="text-sm font-medium">{result.title}</p>
        <p className="text-muted-foreground text-xs">{result.subtitle}</p>
      </div>
    </Link>
  );
}
