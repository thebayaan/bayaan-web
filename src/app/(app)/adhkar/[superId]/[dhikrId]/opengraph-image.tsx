import { notFound } from "next/navigation";
import { getDhikrById, getCategoryById } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";
import { adhkarOgBackground, ogContentType, ogSize, renderOgCard, type OgTheme } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Bayaan dhikr";
export const contentType = ogContentType;
export const size = ogSize;

export function generateImageMetadata() {
  return [
    { id: "dark", alt, size, contentType },
    { id: "light", alt, size, contentType },
  ];
}

export default async function DhikrOg({
  params,
  id,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
  id: Promise<string>;
}) {
  const [{ superId, dhikrId }, imageId] = await Promise.all([params, id]);
  const dhikr = getDhikrById(dhikrId);
  if (!dhikr || dhikr.categoryId !== superId) notFound();

  // Reuse the super-category hero image — a single dhikr card on its own
  // has no art, but the parent super (e.g. Morning Adhkar) does.
  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;
  const category = getCategoryById(superId);
  const theme: OgTheme = imageId === "light" ? "light" : "dark";

  return renderOgCard({
    eyebrow: superCategory?.title ?? category?.title ?? "Adhkar",
    title: "Dhikr",
    subtitle: dhikr.translation,
    backgroundImage: slug ? adhkarOgBackground(slug, theme) : undefined,
    theme,
  });
}
