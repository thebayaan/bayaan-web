import { describe, it, expect, beforeEach } from "vitest";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";

describe("verse-selection-store", () => {
  beforeEach(() => {
    useVerseSelectionStore.setState({ selectedVerseKey: null });
  });

  it("select sets the verseKey", () => {
    useVerseSelectionStore.getState().select("2:255");
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBe("2:255");
  });

  it("toggle flips between null and the verseKey", () => {
    const { toggle } = useVerseSelectionStore.getState();
    toggle("1:1");
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBe("1:1");
    toggle("1:1");
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBeNull();
  });

  it("toggle between two different keys replaces the selection", () => {
    const { toggle } = useVerseSelectionStore.getState();
    toggle("1:1");
    toggle("2:2");
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBe("2:2");
  });

  it("clear resets the selection", () => {
    useVerseSelectionStore.getState().select("3:3");
    useVerseSelectionStore.getState().clear();
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBeNull();
  });
});
