import { describe, it, expect, beforeEach } from "vitest";
import { useVerseSelectionStore } from "@/stores/verse-selection-store";

const MOCK_RECT = { top: 100, left: 200, width: 40, height: 20 };

describe("verse-selection-store", () => {
  beforeEach(() => {
    useVerseSelectionStore.setState({ selectedVerseKey: null, anchorRect: null });
  });

  it("select sets the verseKey and anchorRect", () => {
    useVerseSelectionStore.getState().select("2:255", MOCK_RECT);
    const s = useVerseSelectionStore.getState();
    expect(s.selectedVerseKey).toBe("2:255");
    expect(s.anchorRect).toEqual(MOCK_RECT);
  });

  it("toggle flips between null and the verseKey", () => {
    const { toggle } = useVerseSelectionStore.getState();
    toggle("1:1", MOCK_RECT);
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBe("1:1");
    toggle("1:1", MOCK_RECT);
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBeNull();
    expect(useVerseSelectionStore.getState().anchorRect).toBeNull();
  });

  it("toggle between two different keys replaces the selection", () => {
    const { toggle } = useVerseSelectionStore.getState();
    toggle("1:1", MOCK_RECT);
    const rect2 = { ...MOCK_RECT, top: 300 };
    toggle("2:2", rect2);
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBe("2:2");
    expect(useVerseSelectionStore.getState().anchorRect).toEqual(rect2);
  });

  it("clear resets both selectedVerseKey and anchorRect", () => {
    useVerseSelectionStore.getState().select("3:3", MOCK_RECT);
    useVerseSelectionStore.getState().clear();
    expect(useVerseSelectionStore.getState().selectedVerseKey).toBeNull();
    expect(useVerseSelectionStore.getState().anchorRect).toBeNull();
  });
});
