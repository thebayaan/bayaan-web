import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useContinueReading,
  setContinueReading,
  CONTINUE_READING_KEY,
} from "@/hooks/use-continue-reading";

describe("useContinueReading", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is saved", () => {
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toBeNull();
  });

  it("returns the stored entry", () => {
    localStorage.setItem(
      CONTINUE_READING_KEY,
      JSON.stringify({
        surahId: 2,
        surahName: "Al-Baqarah",
        verseId: 142,
        page: 22,
      }),
    );
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toEqual({
      surahId: 2,
      surahName: "Al-Baqarah",
      verseId: 142,
      page: 22,
    });
  });

  it("updates when setContinueReading is called", () => {
    const { result } = renderHook(() => useContinueReading());
    act(() => {
      setContinueReading({
        surahId: 1,
        surahName: "Al-Fatihah",
        verseId: 1,
        page: 1,
      });
    });
    expect(result.current?.surahId).toBe(1);
  });

  it("returns null for malformed JSON", () => {
    localStorage.setItem(CONTINUE_READING_KEY, "not-json{");
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toBeNull();
  });
});
