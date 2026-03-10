"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PlayerBar } from "./PlayerBar";
import { CollectionProvider } from "./CollectionProvider";
import { GlobalShortcuts } from "./GlobalShortcuts";
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import { PlayerSheet } from "@/components/player/PlayerSheet";
import { AccessibilityEnhancer } from "./AccessibilityEnhancer";
import { FocusManagerProvider, MainContent } from "@/components/ui/FocusManager";
import { PageTransition } from "@/components/ui/PageTransition";
import { ContextualHelp, useContextualTips } from "@/components/ui/ContextualHelp";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — root layout wrapper composing Sidebar, TopBar, main content, and PlayerBar.
 *
 * Layout structure:
 *   ┌─────────────────────────────────┐
 *   │ Sidebar │ TopBar                │
 *   │         ├───────────────────────│
 *   │         │ main content (scroll) │
 *   ├─────────┴───────────────────────│
 *   │ PlayerBar (sticky bottom)       │
 *   └─────────────────────────────────┘
 *
 * Sidebar and TopBar are client components; main + PlayerBar are server-rendered.
 */
export function AppShell({ children }: AppShellProps) {
  const shortcuts = useKeyboardShortcutsHelp();
  const { tips } = useContextualTips();
  const pathname = usePathname();

  // Extract page name from pathname for contextual help
  const currentPage = pathname.split('/')[1] || 'home';

  return (
    <CollectionProvider>
      <FocusManagerProvider>
        <AccessibilityEnhancer />
        <GlobalShortcuts onShowShortcutsHelp={shortcuts.open} />
        <KeyboardShortcutsHelp
          isOpen={shortcuts.isOpen}
          onClose={shortcuts.close}
        />
        <PlayerSheet />

        <div
          className="flex h-screen overflow-hidden"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          {/* Sidebar */}
          <nav id="navigation" role="navigation" aria-label="Main navigation">
            <Sidebar />
          </nav>

          {/* Right column: TopBar + content + PlayerBar */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top bar */}
            <TopBar onShowShortcutsHelp={shortcuts.open} />

            {/* Scrollable main content with enhanced focus management */}
            <MainContent className="flex-1 overflow-y-auto overflow-x-hidden">
              <PageTransition>
                {children}
              </PageTransition>
            </MainContent>

            {/* Sticky player bar */}
            <section id="player" role="region" aria-label="Audio player controls">
              <PlayerBar />
            </section>
          </div>
        </div>

        {/* Contextual help system */}
        <ContextualHelp tips={tips} page={currentPage} />
      </FocusManagerProvider>
    </CollectionProvider>
  );
}
