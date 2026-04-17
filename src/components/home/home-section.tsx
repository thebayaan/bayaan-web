"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

function useColumns(): number {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    function calc(): void {
      const w = window.innerWidth;
      if (w >= 1280) setCols(7);
      else if (w >= 1024) setCols(6);
      else if (w >= 768) setCols(5);
      else if (w >= 640) setCols(4);
      else setCols(3);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return cols;
}

interface HomeSectionProps {
  title: string;
  seeAllHref?: string;
  children: ReactNode;
}

export function HomeSection({ title, seeAllHref, children }: HomeSectionProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const cols = useColumns();
  const totalPages = Math.max(1, Math.ceil(items.length / cols));
  const [page, setPage] = useState(0);

  const visibleItems = items.slice(page * cols, page * cols + cols);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <section className="mb-8 px-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold">{title}</h2>
          {seeAllHref ? (
            <Link
              href={seeAllHref}
              className="text-muted-foreground hover:text-foreground rounded-full border border-[var(--text-alpha-10)] px-3 py-0.5 text-[11px] font-medium transition-colors"
            >
              View all
            </Link>
          ) : null}
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrev}
              aria-label="Previous"
              className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors disabled:opacity-30"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={!hasNext}
              aria-label="Next"
              className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors disabled:opacity-30"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {visibleItems}
      </div>
    </section>
  );
}
