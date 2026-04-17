import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomPlayerBar } from "./bottom-player-bar";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        </div>
      </div>
      <div className="hidden md:block">
        <BottomPlayerBar />
      </div>
      <MobileTabBar />
    </div>
  );
}
