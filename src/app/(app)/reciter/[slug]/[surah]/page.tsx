import type { Metadata } from "next";
import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ogRecitationUrl } from "@/lib/og-urls";
import { fetchReciterServerSide } from "@/lib/reciter-server";
import { DeepLinkPlayerMount } from "@/components/player/deep-link-player-mount";
import { ReciterPageClient } from "../reciter-page-client";

const surahs = surahData as unknown as Surah[];

function parseSurah(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 114) return null;
  return n;
}

type SearchParams = {
  rewayah?: string | string[];
  t?: string | string[];
  autoplay?: string | string[];
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; surah: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug, surah } = await params;
  const { rewayah } = await searchParams;
  const n = parseSurah(surah);
  if (!n) return { title: "Recitation not found" };

  const [reciter, match] = await Promise.all([
    fetchReciterServerSide(slug),
    Promise.resolve(surahs.find((s) => s.id === n)),
  ]);
  const surahName = match?.name ?? `Surah ${n}`;
  const reciterName = reciter?.name ?? slug;
  const rewayahParam = pickFirst(rewayah);
  const ogUrl = ogRecitationUrl(slug, n, rewayahParam);
  // Layout template appends " | Bayaan". Spotify-style: "X - recitation by Y".
  const title = `${surahName} - recitation by ${reciterName}`;
  const description = `Listen to Surah ${surahName} recited by ${reciterName} on Bayaan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 1200, alt: `${surahName} - ${reciterName}` }],
    },
    twitter: {
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function RecitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; surah: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<React.ReactElement> {
  const { slug, surah } = await params;
  const n = parseSurah(surah);
  if (!n) notFound();

  const { rewayah, t, autoplay } = await searchParams;
  const rewayahParam = pickFirst(rewayah);
  const tRaw = pickFirst(t);
  const autoplayRaw = pickFirst(autoplay);
  const tSec = tRaw !== undefined ? Number(tRaw) : undefined;
  const tSecValid = tSec !== undefined && Number.isFinite(tSec) && tSec >= 0 ? tSec : undefined;
  // Deep-linked share URLs with a path-specified surah default to autoplay
  // unless explicitly opted out (?autoplay=0). Matches mobile app behavior.
  const autoplayOn = autoplayRaw === "0" || autoplayRaw === "false" ? false : true;

  return (
    <>
      <DeepLinkPlayerMount
        slug={slug}
        surahNum={n}
        rewayah={rewayahParam}
        tSec={tSecValid}
        autoplay={autoplayOn}
      />
      <ReciterPageClient slug={slug} />
    </>
  );
}
