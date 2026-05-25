import Link from "next/link";
import type { AdhkarSuperCategory } from "@/data/adhkar-super-categories";

interface AdhkarSuperCardProps {
  category: AdhkarSuperCategory;
  href?: string;
}

export function AdhkarSuperCard({ category, href }: AdhkarSuperCardProps) {
  const target = href ?? `/adhkar/${category.id}`;

  return (
    <Link href={target} className="group block transition-transform hover:scale-[1.02]">
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.imageLight}
          alt=""
          className="absolute inset-0 h-full w-full object-cover dark:hidden"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.imageDark}
          alt=""
          className="absolute inset-0 hidden h-full w-full object-cover dark:block"
          loading="lazy"
        />
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold">{category.title}</p>
      <p className="text-muted-foreground truncate text-[10px]">{category.arabicTitle}</p>
    </Link>
  );
}
