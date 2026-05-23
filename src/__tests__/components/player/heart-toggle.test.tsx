import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";

// HeartToggle runs through useAuthGate, which gates on useAuth from @/lib/auth.
// In tests CLERK_ENABLED is false (no env var) so the guest fallback would
// otherwise treat us as signed-out and swallow the click.
vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ isSignedIn: true, isLoaded: true }),
  CLERK_ENABLED: true,
}));

import { HeartToggle } from "@/components/player/heart-toggle";

const API = "http://localhost:3000/api";

function Wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

const ref = { reciter_id: "r1", rewayat_id: "rw1", surah_id: 36 };

describe("HeartToggle", () => {
  it("renders an unpressed heart when the track is not favorited", async () => {
    render(<HeartToggle target={ref} trackTitle="Ya-Sin" />, { wrapper: Wrapper });
    const btn = await screen.findByRole("button", { name: /save ya-sin to favorites/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to pressed after a click and the favorite is reflected in the cache", async () => {
    let serverList: Array<typeof ref & { id: string; created_at: string }> = [];
    server.use(
      http.get(`${API}/bayaan/user/favorites`, () => HttpResponse.json({ data: serverList })),
      http.post(`${API}/bayaan/user/favorites`, async ({ request }) => {
        const body = (await request.json()) as typeof ref;
        const created = {
          ...body,
          id: `fav-${body.surah_id}`,
          created_at: new Date().toISOString(),
        };
        serverList.push(created);
        return HttpResponse.json({ data: created });
      }),
      http.delete(`${API}/bayaan/user/favorites/:id`, ({ params }) => {
        serverList = serverList.filter((f) => f.id !== params.id);
        return HttpResponse.json({ data: { deleted: true } });
      }),
    );

    const user = userEvent.setup();
    render(<HeartToggle target={ref} trackTitle="Ya-Sin" />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: /save ya-sin to favorites/i }));
    const pressed = await screen.findByRole(
      "button",
      { name: /remove ya-sin from favorites/i },
      { timeout: 3000 },
    );
    expect(pressed).toHaveAttribute("aria-pressed", "true");

    await user.click(pressed);
    const unpressed = await screen.findByRole(
      "button",
      { name: /save ya-sin to favorites/i },
      { timeout: 3000 },
    );
    expect(unpressed).toHaveAttribute("aria-pressed", "false");
  });
});
