import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ogMushafUrl } from "@/lib/og-urls";
import { MushafPageClient } from "./mushaf-page-client";

const TOTAL_PAGES = 604;

function resolvePage(page: string): number | null {
  const n = Number(page);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_PAGES) return null;
  return n;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const n = resolvePage(page);
  if (!n) return { title: "Mushaf page not found" };
  return {
    title: `Page ${n} - Qur'an mushaf`,
    description: `Read page ${n} of the Holy Qur'an in the traditional mushaf layout.`,
    openGraph: {
      images: [{ url: ogMushafUrl(n), width: 1200, height: 1200 }],
    },
    twitter: {
      images: [ogMushafUrl(n)],
    },
  };
}

export default async function MushafPageRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<React.ReactElement> {
  const { page } = await params;
  const n = resolvePage(page);
  if (!n) notFound();
  return <MushafPageClient initialPage={n} />;
}
