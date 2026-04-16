import type { ReactElement, ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { RecitersPreloader } from "@/components/layout/reciters-preloader";

export default function AppLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AppShell>
      <KeyboardShortcuts />
      <RecitersPreloader />
      {children}
    </AppShell>
  );
}
