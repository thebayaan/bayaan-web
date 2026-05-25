import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { mutate } from "swr";
import { server } from "@/__tests__/mocks/server";
import { useTranslationResources, FALLBACK_TRANSLATIONS } from "@/hooks/use-translation-resources";

describe("useTranslationResources", () => {
  beforeEach(async () => {
    await mutate("quran-translation-resources", undefined, { revalidate: false });
  });

  it("returns API translations when available", async () => {
    const { result } = renderHook(() => useTranslationResources());
    await waitFor(() => {
      expect(result.current.translations.length).toBeGreaterThan(0);
    });
    expect(result.current.translations[0]?.name).toBe("Clear Quran");
    expect(result.current.isLoading).toBe(false);
  });

  it("falls back to curated translations when the API fails", async () => {
    await mutate("quran-translation-resources", undefined, { revalidate: false });
    server.use(
      http.get("http://localhost:3000/api/quran/resources/translations", () =>
        HttpResponse.json({ error: "down" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useTranslationResources());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.translations).toEqual(FALLBACK_TRANSLATIONS);
  });
});
