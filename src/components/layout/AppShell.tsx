import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PlayerBar } from "./PlayerBar";

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
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Right column: TopBar + content + PlayerBar */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <TopBar />

        {/* Scrollable main content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          id="main-content"
          role="main"
        >
          {children}
        </main>

        {/* Sticky player bar */}
        <PlayerBar />
      </div>
    </div>
  );
}
