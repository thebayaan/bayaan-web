import type { ReactNode } from "react";
import Link from "next/link";

interface SettingsShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsShell({ title, description, children }: SettingsShellProps) {
  return (
    <div className="max-w-2xl p-6">
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        &larr; Settings
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{title}</h1>
      {description ? <p className="text-muted-foreground mb-6 text-sm">{description}</p> : null}
      {children}
    </div>
  );
}
