"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getDhikrById, getDhikrPlaybackUrl } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";
import { getDhikrNeighbors } from "@/lib/adhkar-navigation";
import { AdhkarAudioControls } from "@/components/adhkar/adhkar-audio-controls";
import { AdhkarArabicText } from "@/components/adhkar/adhkar-arabic-text";
import { TasbeehCounter } from "@/components/adhkar/tasbeeh-counter";
import { NextIcon, PreviousIcon } from "@/components/icons";

interface DhikrPageClientProps {
  superId: string;
  dhikrId: string;
  playAll?: boolean;
}

export function DhikrPageClient({ superId, dhikrId, playAll = false }: DhikrPageClientProps) {
  const router = useRouter();
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr) notFound();

  const superSlug = resolveAdhkarSuperSlug(superId);
  const superCategory = superSlug ? ALL_ADHKAR_SUPER.find((s) => s.id === superSlug) : null;
  const matches = superCategory
    ? superCategory.categoryIds.includes(dhikr.categoryId)
    : dhikr.categoryId === superId;
  if (!matches) notFound();

  const playbackUrl = getDhikrPlaybackUrl(dhikr);
  const { prev, next, index, total } = getDhikrNeighbors(superId, dhikrId);

  const dhikrHref = useCallback(
    (targetId: string) =>
      playAll ? `/adhkar/${superId}/${targetId}?playAll=1` : `/adhkar/${superId}/${targetId}`,
    [playAll, superId],
  );

  const goTo = useCallback(
    (targetId: string) => {
      router.push(dhikrHref(targetId));
    },
    [router, dhikrHref],
  );

  const advancePlayAll = useCallback(() => {
    if (!playAll || !next) return;
    router.push(dhikrHref(next.id));
  }, [playAll, next, router, dhikrHref]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && prev) goTo(prev.id);
      if (event.key === "ArrowRight" && next) goTo(next.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, prev, next]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center p-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <Link
          href={`/adhkar/${superId}`}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          &larr; Back
        </Link>
        {total > 0 ? (
          <span className="text-muted-foreground text-xs tabular-nums">
            {index + 1} / {total}
          </span>
        ) : null}
      </div>

      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        <AdhkarArabicText className="mb-6 text-center text-2xl sm:text-3xl">
          {dhikr.arabic}
        </AdhkarArabicText>

        {dhikr.transliteration ? (
          <p className="text-muted-foreground mb-4 max-w-xl text-center text-xs italic">
            {dhikr.transliteration}
          </p>
        ) : null}
        <p className="text-muted-foreground mb-8 max-w-xl text-center text-sm">
          {dhikr.translation}
        </p>

        {playbackUrl ? (
          <AdhkarAudioControls audioUrl={playbackUrl} autoPlay={playAll} onEnded={advancePlayAll} />
        ) : null}

        <TasbeehCounter dhikrId={dhikr.id} target={dhikr.repeatCount} />

        {dhikr.instruction ? (
          <p className="text-muted-foreground mt-6 max-w-md text-center text-xs">
            {dhikr.instruction}
          </p>
        ) : null}

        <div className="mt-8 flex w-full max-w-md items-center justify-between gap-3">
          {prev ? (
            <Link
              href={dhikrHref(prev.id)}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg bg-[var(--text-alpha-04)] px-3 py-2 text-sm transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <PreviousIcon size={16} />
              Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={dhikrHref(next.id)}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg bg-[var(--text-alpha-04)] px-3 py-2 text-sm transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              Next
              <NextIcon size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
