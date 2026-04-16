import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

type CTA =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: MouseEventHandler<HTMLButtonElement>; href?: never };

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  cta?: CTA;
}

export function EmptyState({ icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="text-muted-foreground" aria-hidden>
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-muted-foreground max-w-sm text-sm">{subtitle}</p> : null}
      {cta ? <EmptyStateCTA cta={cta} /> : null}
    </div>
  );
}

function EmptyStateCTA({ cta }: { cta: CTA }) {
  const className =
    "bg-brand-main text-brand-main-foreground hover:bg-brand-strong rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-fast ease-standard";
  if ("href" in cta && cta.href) {
    return (
      <Link href={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  );
}
