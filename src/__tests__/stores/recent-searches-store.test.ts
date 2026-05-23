import { describe, it, expect, beforeEach } from "vitest";
import { useRecentSearchesStore } from "@/stores/recent-searches-store";

describe("useRecentSearchesStore", () => {
  beforeEach(() => {
    useRecentSearchesStore.setState({ entries: [] });
  });

  it("push prepends a new entry with a searchedAt timestamp", () => {
    useRecentSearchesStore.getState().push("mishary");
    const [entry] = useRecentSearchesStore.getState().entries;
    expect(entry?.query).toBe("mishary");
    expect(entry?.searchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("trims whitespace and ignores queries shorter than 2 chars", () => {
    useRecentSearchesStore.getState().push("  a  ");
    useRecentSearchesStore.getState().push("   ");
    useRecentSearchesStore.getState().push("  alafasy  ");
    const entries = useRecentSearchesStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0]?.query).toBe("alafasy");
  });

  it("dedupes case-insensitively and promotes duplicates to the top", () => {
    useRecentSearchesStore.getState().push("Alafasy");
    useRecentSearchesStore.getState().push("Mishary");
    useRecentSearchesStore.getState().push("alafasy");
    const entries = useRecentSearchesStore.getState().entries;
    expect(entries).toHaveLength(2);
    // Most recent first, with the newest casing preserved.
    expect(entries[0]?.query).toBe("alafasy");
    expect(entries[1]?.query).toBe("Mishary");
  });

  it("caps the list at 10 entries", () => {
    for (let i = 0; i < 15; i++) {
      useRecentSearchesStore.getState().push(`query${i}`);
    }
    expect(useRecentSearchesStore.getState().entries).toHaveLength(10);
    expect(useRecentSearchesStore.getState().entries[0]?.query).toBe("query14");
  });

  it("remove drops a single entry by query, clearAll empties everything", () => {
    useRecentSearchesStore.getState().push("alpha");
    useRecentSearchesStore.getState().push("beta");
    useRecentSearchesStore.getState().push("gamma");
    useRecentSearchesStore.getState().remove("beta");
    expect(useRecentSearchesStore.getState().entries.map((e) => e.query)).toEqual([
      "gamma",
      "alpha",
    ]);
    useRecentSearchesStore.getState().clearAll();
    expect(useRecentSearchesStore.getState().entries).toEqual([]);
  });
});
