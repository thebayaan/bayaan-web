import Link from "next/link";
import { MAIN_ADHKAR, OTHER_ADHKAR, buildSuperCategoryMap } from "@/data/adhkar-super-categories";
import { getCategories } from "@/data/adhkar-data";
import { AdhkarSuperCard } from "@/components/adhkar/adhkar-super-card";

export default function AdhkarPage() {
  const allCategories = getCategories();
  const superMap = buildSuperCategoryMap();

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold">Adhkar</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {allCategories.length} collections from Hisnul Muslim
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Main</h2>
        <nav
          aria-label="Main adhkar topics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {MAIN_ADHKAR.map((cat) => (
            <AdhkarSuperCard key={cat.id} category={cat} />
          ))}
        </nav>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Other</h2>
        <nav
          aria-label="Other adhkar topics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {OTHER_ADHKAR.map((cat) => (
            <AdhkarSuperCard key={cat.id} category={cat} />
          ))}
        </nav>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">All collections</h2>
        <nav
          aria-label="All adhkar categories"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {allCategories.map((cat) => {
            const superCategory = superMap.get(cat.id);
            return (
              <Link
                key={cat.id}
                href={`/adhkar/${cat.id}`}
                className="hover:bg-[var(--text-alpha-04)] flex items-center gap-3 rounded-lg border border-[var(--text-alpha-06)] p-3 transition-colors"
              >
                {superCategory ? (
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={superCategory.imageLight}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover dark:hidden"
                      loading="lazy"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={superCategory.imageDark}
                      alt=""
                      className="absolute inset-0 hidden h-full w-full object-cover dark:block"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="bg-[var(--text-alpha-06)] h-12 w-16 shrink-0 rounded-md" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm leading-snug font-medium">{cat.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {cat.dhikrCount} {cat.dhikrCount === 1 ? "dhikr" : "adhkar"}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}
