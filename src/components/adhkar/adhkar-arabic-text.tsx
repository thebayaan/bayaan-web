import { cn } from "@/lib/utils";

interface AdhkarArabicTextProps {
  children: string;
  className?: string;
}

/** Arabic dhikr text — Scheherazade New (not UthmanicHafs) so ornate brackets render correctly. */
export function AdhkarArabicText({ children, className }: AdhkarArabicTextProps) {
  return (
    <p
      className={cn("font-scheherazade text-right leading-[1.9] tracking-normal", className)}
      dir="rtl"
      lang="ar"
    >
      {children}
    </p>
  );
}
