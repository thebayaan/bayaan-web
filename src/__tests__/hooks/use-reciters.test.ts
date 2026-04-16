import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReciters } from "@/hooks/use-reciters";

vi.mock("@/lib/api", () => ({
  fetchBayaan: vi.fn().mockResolvedValue({
    data: [
      {
        id: "r-1",
        name: "Mishary Alafasy",
        slug: "mishary-alafasy",
        image_url: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
        is_featured: true,
        rewayat: [
          {
            id: "rw-1",
            reciter_id: "r-1",
            name: "Hafs",
            style: "murattal",
            server: "https://cdn.thebayaan.com/test",
            source_type: "bayaan",
            surah_total: 114,
            surah_list: Array.from({ length: 114 }, (_, i) => i + 1),
            mp3quran_read_id: 12,
            qdc_reciter_id: null,
          },
        ],
      },
    ],
    pagination: { page: 1, limit: 200, total: 1 },
  }),
}));

describe("useReciters", () => {
  it("fetches and returns reciters", async () => {
    const { result } = renderHook(() => useReciters());
    await waitFor(() => {
      expect(result.current.reciters).toHaveLength(1);
    });
    expect(result.current.reciters[0]?.name).toBe("Mishary Alafasy");
    expect(result.current.isLoading).toBe(false);
  });

  it("returns featured reciters", async () => {
    const { result } = renderHook(() => useReciters());
    await waitFor(() => {
      expect(result.current.featured).toHaveLength(1);
    });
  });
});
