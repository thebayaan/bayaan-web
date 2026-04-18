import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomPlayerBar } from "./bottom-player-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-x-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto overscroll-contain">{children}</main>
        </div>
      </div>
      <BottomPlayerBar />
    </div>
  );
}
