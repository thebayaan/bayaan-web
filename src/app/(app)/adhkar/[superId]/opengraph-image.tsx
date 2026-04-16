import { notFound } from "next/navigation";
import { getCategoryById } from "@/data/adhkar-data";
import { ogSize, ogContentType, renderOgCard } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Bayaan adhkar category";
export const size = ogSize;
export const contentType = ogContentType;

export default async function AdhkarCategoryOg({
  params,
}: {
  params: Promise<{ superId: string }>;
}) {
  const { superId } = await params;
  const category = getCategoryById(superId);
  if (!category) notFound();

  return renderOgCard({
    eyebrow: "Adhkar",
    title: category.title,
    subtitle: `${category.dhikrCount} ${category.dhikrCount === 1 ? "dhikr" : "adhkar"} · Hisnul Muslim`,
  });
}
