import Link from "next/link";
import { getCategories, colorForCategory } from "@/data/adhkar-data";

export default function AdhkarPage() {
  const categories = getCategories();
  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold">Adhkar</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {categories.length} collections from Hisnul Muslim
      </p>
      <nav
        aria-label="Adhkar categories"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map((cat) => {
          const color = colorForCategory(cat);
          return (
            <Link
              key={cat.id}
              href={`/adhkar/${cat.id}`}
              className="block rounded-xl border p-4 transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: color + "18", borderColor: color + "40" }}
            >
              <p className="text-sm leading-snug font-medium">{cat.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {cat.dhikrCount} {cat.dhikrCount === 1 ? "dhikr" : "adhkar"}
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
