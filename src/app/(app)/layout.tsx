"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  useKeyboardShortcuts();
  return <AppShell>{children}</AppShell>;
}
