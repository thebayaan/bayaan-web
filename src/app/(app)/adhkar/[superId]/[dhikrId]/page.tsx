import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDhikrById } from "@/data/adhkar-data";
import { ogDhikrUrl } from "@/lib/og-urls";
import { DhikrPageClient } from "./dhikr-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}): Promise<Metadata> {
  const { superId, dhikrId } = await params;
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr || dhikr.categoryId !== superId) return { title: "Dhikr not found" };
  const category = dhikr.categoryId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `Dhikr - ${category}`,
    description: dhikr.translation,
    openGraph: {
      images: [{ url: ogDhikrUrl(superId, dhikrId), width: 1200, height: 800 }],
    },
    twitter: {
      images: [ogDhikrUrl(superId, dhikrId)],
    },
  };
}

export default async function DhikrPage({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}): Promise<React.ReactElement> {
  const { superId, dhikrId } = await params;
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr || dhikr.categoryId !== superId) notFound();
  return <DhikrPageClient superId={superId} dhikrId={dhikrId} />;
}
