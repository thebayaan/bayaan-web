import type { ReactElement, ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { RecitersPreloader } from "@/components/layout/reciters-preloader";
import { TajweedPreloader } from "@/components/layout/tajweed-preloader";
import { CommandPalette } from "@/components/command-palette/command-palette";

export default function AppLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <AppShell>
      <KeyboardShortcuts />
      <RecitersPreloader />
      <TajweedPreloader />
      <CommandPalette />
      {children}
    </AppShell>
  );
}
