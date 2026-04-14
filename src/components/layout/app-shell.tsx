import { Sidebar } from "./sidebar";
import { BottomPlayerBar } from "./bottom-player-bar";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <div className="hidden md:block">
        <BottomPlayerBar />
      </div>
      <MobileTabBar />
    </div>
  );
}
