import { MAIN_ADHKAR, OTHER_ADHKAR } from "@/data/adhkar-super-categories";
import { getCategories } from "@/data/adhkar-data";
import { AdhkarSuperCard } from "@/components/adhkar/adhkar-super-card";

export default function AdhkarPage() {
  const allCategories = getCategories();

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
    </div>
  );
}
