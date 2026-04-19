import Link from "next/link";
import { ALL_ADHKAR_SUPER } from "@/data/adhkar-super-categories";
import { getCategories, colorForCategory } from "@/data/adhkar-data";

export default function AdhkarPage() {
  const allCategories = getCategories();

  // Build a map from numbered category IDs to super-category for image lookup
  const superMap = new Map<string, (typeof ALL_ADHKAR_SUPER)[number]>();
  for (const sc of ALL_ADHKAR_SUPER) {
    for (const cid of sc.categoryIds) {
      superMap.set(cid, sc);
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold">Adhkar</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {allCategories.length} collections from Hisnul Muslim
      </p>

      {/* Super-categories with images */}
      <h2 className="mb-3 text-sm font-semibold">Browse by topic</h2>
      <nav
        aria-label="Adhkar topics"
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {ALL_ADHKAR_SUPER.map((cat) => (
          <Link
            key={cat.id}
            href={`/adhkar/${cat.id}`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageLight}
                alt=""
                className="absolute inset-0 h-full w-full object-cover dark:hidden"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageDark}
                alt=""
                className="absolute inset-0 hidden h-full w-full object-cover dark:block"
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 truncate text-[13px] font-semibold">{cat.title}</p>
            <p className="text-muted-foreground truncate text-[10px]">{cat.arabicTitle}</p>
          </Link>
        ))}
      </nav>

      {/* All individual categories */}
      <h2 className="mb-3 text-sm font-semibold">All categories</h2>
      <nav
        aria-label="All adhkar categories"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {allCategories.map((cat) => {
          const color = colorForCategory(cat);
          return (
            <Link
              key={cat.id}
              href={`/adhkar/${cat.id}`}
              className="block rounded-md border p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
              style={{ borderColor: color + "40" }}
            >
              <p className="text-sm leading-snug font-medium">{cat.title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {cat.dhikrCount} {cat.dhikrCount === 1 ? "dhikr" : "adhkar"}
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
