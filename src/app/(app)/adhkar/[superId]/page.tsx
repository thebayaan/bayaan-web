import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getDhikrByCategory } from "@/data/adhkar-data";

export default async function AdhkarCategoryPage({
  params,
}: {
  params: Promise<{ superId: string }>;
}) {
  const { superId } = await params;
  const category = getCategoryById(superId);
  if (!category) notFound();

  const dhikrList = getDhikrByCategory(superId);

  return (
    <div className="p-6">
      <Link
        href="/adhkar"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        &larr; Adhkar
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{category.title}</h1>
      <div className="space-y-3">
        {dhikrList.map((dhikr) => (
          <Link
            key={dhikr.id}
            href={`/adhkar/${superId}/${dhikr.id}`}
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
