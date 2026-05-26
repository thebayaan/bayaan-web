import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomPlayerBar } from "./bottom-player-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-x-hidden">
      {/* Keyboard users hit Tab on first focus; let them jump past the
       * sidebar and top bar to the page content. Visible only when focused. */}
      <a
        href="#main-content"
        className="bg-brand-main text-brand-main-foreground sr-only z-50 rounded-md px-3 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto overscroll-contain focus:outline-none"
          >
            {children}
          </main>
        </div>
      </div>
      <BottomPlayerBar />
    </div>
  );
}
