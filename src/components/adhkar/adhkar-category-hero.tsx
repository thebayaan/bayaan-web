import type { AdhkarSuperCategory } from "@/data/adhkar-super-categories";

interface AdhkarCategoryHeroProps {
  superCategory: AdhkarSuperCategory;
}

export function AdhkarCategoryHero({ superCategory }: AdhkarCategoryHeroProps) {
  return (
    <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl sm:aspect-[3/1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={superCategory.imageLight}
        alt=""
        className="absolute inset-0 h-full w-full object-cover dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={superCategory.imageDark}
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover dark:block"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="font-scheherazade text-lg text-white/90" dir="rtl" lang="ar">
          {superCategory.arabicTitle}
        </p>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{superCategory.title}</h1>
      </div>
    </div>
  );
}
