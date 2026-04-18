import type { Metadata } from "next";
import { notFound } from "next/navigation";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { ogRecitationUrl } from "@/lib/og-urls";
import { DeepLinkPlayerMount } from "@/components/player/deep-link-player-mount";

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
  const match = surahs.find((s) => s.id === n);
  const rewayahParam = pickFirst(rewayah);
  const ogUrl = ogRecitationUrl(slug, n, rewayahParam);
  return {
    title: `Surah ${match?.name ?? n} — ${slug}`,
    description: `Listen to Surah ${match?.name ?? n} recited by ${slug}.`,
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
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
  const autoplayOn = autoplayRaw === "1" || autoplayRaw === "true";

  const match = surahs.find((s) => s.id === n);

  return (
    <div className="p-10">
      <DeepLinkPlayerMount
        slug={slug}
        surahNum={n}
        rewayah={rewayahParam}
        tSec={tSecValid}
        autoplay={autoplayOn}
      />
      <h1 className="mb-2 text-2xl font-bold">
        {match ? `Surah ${match.name}` : `Surah ${n}`}
        <span className="text-muted-foreground ml-2 text-base font-medium">by {slug}</span>
      </h1>
      <p className="text-muted-foreground text-sm">
        Loading recitation{rewayahParam ? ` (rewayah: ${rewayahParam})` : ""}…
      </p>
    </div>
  );
}
