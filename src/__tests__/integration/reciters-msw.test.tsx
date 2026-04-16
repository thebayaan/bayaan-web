import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useReciters } from "@/hooks/use-reciters";

function wrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useReciters with MSW", () => {
  it("fetches reciters through the real api helper against mocked network", async () => {
    const { result } = renderHook(() => useReciters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.reciters.length).toBeGreaterThan(0);
    expect(result.current.featured.length).toBeGreaterThan(0);
    expect(result.current.reciters[0]?.rewayat[0]?.name).toBe("Hafs an Asim");
  });
});
