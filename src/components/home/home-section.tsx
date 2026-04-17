import type { ReactNode } from "react";
import Link from "next/link";

interface HomeSectionProps {
  title: string;
  seeAllHref?: string;
  children: ReactNode;
}

export function HomeSection({ title, seeAllHref, children }: HomeSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-base font-bold">{title}</h2>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            See all
          </Link>
        ) : null}
      </div>
      <div className="scrollbar-none -mx-6 flex gap-3 overflow-x-auto px-6 pb-2">{children}</div>
    </section>
  );
}
