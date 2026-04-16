import type { ReactElement, ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";

export default function AppLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AppShell>
      <KeyboardShortcuts />
      {children}
    </AppShell>
  );
}
