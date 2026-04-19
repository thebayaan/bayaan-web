import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getDhikrByCategory } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";
import { adhkarOgBackground, type OgTheme } from "@/lib/og";

type SearchParams = { theme?: string | string[] };

function pickFirst(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Accepts either a slug ("morning-adhkar") or a numeric Hisnul Muslim
// category id ("27"). Returns the resolved super category when the
// input is a slug, otherwise the raw adhkar category when it's a number.
function resolveAdhkar(superId: string) {
  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;
  if (superCategory) {
    const firstCategoryId = superCategory.categoryIds[0];
    const category = firstCategoryId ? getCategoryById(firstCategoryId) : undefined;
    return { superCategory, category, slug: superCategory.id };
  }
  const category = getCategoryById(superId);
  return category ? { superCategory: null, category, slug: null } : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ superId: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { superId } = await params;
  const { theme } = await searchParams;
  const resolved = resolveAdhkar(superId);
  if (!resolved) return { title: "Adhkar category not found" };

  const t: OgTheme = pickFirst(theme) === "light" ? "light" : "dark";
  const { superCategory, category, slug } = resolved;
  const title = superCategory?.title ?? category?.title ?? "Adhkar";
  const description = category
    ? `${category.dhikrCount} ${category.dhikrCount === 1 ? "dhikr" : "adhkar"} from Hisnul Muslim.`
    : "Hisnul Muslim";

  // Point og:image straight at the CDN hero — no Next render, no
  // text overlay. Preview cards use og:title + og:description for
  // the label already.
  const imageUrl = slug ? adhkarOgBackground(slug, t) : undefined;
  const images = imageUrl ? [{ url: imageUrl, width: 900, height: 600, alt: title }] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { title, description, images: imageUrl ? [imageUrl] : undefined },
  };
}

export default async function AdhkarCategoryPage({
  params,
}: {
  params: Promise<{ superId: string }>;
}) {
  const { superId } = await params;
  const resolved = resolveAdhkar(superId);
  if (!resolved) notFound();

  const { superCategory, category, slug } = resolved;
  // When the URL is a slug, expand to every child category's dhikr
  // list. When numeric, just fetch that one category's list.
  const dhikrList = superCategory
    ? superCategory.categoryIds.flatMap((id) => getDhikrByCategory(id))
    : category
      ? getDhikrByCategory(category.id)
      : [];

  const title = superCategory?.title ?? category?.title ?? "Adhkar";
  const dhikrUrlPrefix = slug ?? category?.id;

  return (
    <div className="p-6">
      <Link
        href="/adhkar"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        &larr; Adhkar
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <div className="space-y-3">
        {dhikrList.map((dhikr) => (
          <Link
            key={dhikr.id}
            href={`/adhkar/${dhikrUrlPrefix}/${dhikr.id}`}
            className="block rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <p className="font-[UthmanicHafs] text-lg leading-relaxed" dir="rtl" lang="ar">
              {dhikr.arabic}
            </p>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{dhikr.translation}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[var(--text-alpha-06)] px-2 py-0.5 text-xs">
                {dhikr.repeatCount}x
              </span>
              {dhikr.instruction ? (
                <span className="text-muted-foreground line-clamp-1 text-xs">
                  {dhikr.instruction}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
