import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDhikrById } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";
import { DhikrPageClient } from "./dhikr-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}): Promise<Metadata> {
  const { superId, dhikrId } = await params;
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr || dhikr.categoryId !== superId) return { title: "Dhikr not found" };

  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;
  const categoryLabel = superCategory?.title ?? "Adhkar";
  const title = `Dhikr - ${categoryLabel}`;
  const description = dhikr.translation;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
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
