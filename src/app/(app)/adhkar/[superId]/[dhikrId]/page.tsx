import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDhikrById } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";
import { adhkarOgBackground, type OgTheme } from "@/lib/og";
import { DhikrPageClient } from "./dhikr-page-client";

type SearchParams = { theme?: string | string[]; playAll?: string | string[] };

function pickFirst(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Accepts either the super-category slug ("morning-adhkar") or a numeric
// category id ("27"). Returns { superSlug, dhikr } when the superId
// validly contains the requested dhikr, else null.
function resolveDhikr(superId: string, dhikrId: string) {
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr) return null;

  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;

  if (superCategory) {
    if (!superCategory.categoryIds.includes(dhikr.categoryId)) return null;
    return { dhikr, superCategory, superSlug: superCategory.id };
  }
  if (dhikr.categoryId !== superId) return null;
  return { dhikr, superCategory: null, superSlug: null };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { superId, dhikrId } = await params;
  const { theme } = await searchParams;
  const resolved = resolveDhikr(superId, dhikrId);
  if (!resolved) return { title: "Dhikr not found" };

  const t: OgTheme = pickFirst(theme) === "light" ? "light" : "dark";
  const { dhikr, superCategory, superSlug } = resolved;
  const categoryLabel = superCategory?.title ?? "Adhkar";
  const title = `Dhikr - ${categoryLabel}`;
  const description = dhikr.translation;

  const imageUrl = superSlug ? adhkarOgBackground(superSlug, t) : undefined;
  const images = imageUrl
    ? [{ url: imageUrl, width: 900, height: 600, alt: categoryLabel }]
    : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { title, description, images: imageUrl ? [imageUrl] : undefined },
  };
}

export default async function DhikrPage({
  params,
  searchParams,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<React.ReactElement> {
  const { superId, dhikrId } = await params;
  const { playAll } = await searchParams;
  const resolved = resolveDhikr(superId, dhikrId);
  if (!resolved) notFound();
  return (
    <DhikrPageClient
      superId={superId}
      dhikrId={dhikrId}
      playAll={pickFirst(playAll) === "1"}
    />
  );
}
