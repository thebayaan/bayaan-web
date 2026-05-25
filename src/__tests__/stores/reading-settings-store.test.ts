import { describe, it, expect, beforeEach } from "vitest";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

describe("reading-settings-store", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState(useReadingSettingsStore.getInitialState());
  });

  it("defaults to cream light theme", () => {
    expect(useReadingSettingsStore.getState().lightThemeId).toBe("default");
  });
  it("defaults to dark navy", () => {
    expect(useReadingSettingsStore.getState().darkThemeId).toBe("dark-default");
  });
  it("defaults to Saheeh International", () => {
    expect(useReadingSettingsStore.getState().translationIds).toContain("131");
  });
  it("sets font size", () => {
    useReadingSettingsStore.getState().setFontSize(2.4);
    expect(useReadingSettingsStore.getState().fontSize).toBe(2.4);
  });
  it("toggles transliteration", () => {
    useReadingSettingsStore.getState().toggleTransliteration();
    expect(useReadingSettingsStore.getState().showTransliteration).toBe(true);
  });
  it("toggles word-by-word", () => {
    useReadingSettingsStore.getState().toggleWordByWord();
    expect(useReadingSettingsStore.getState().showWordByWord).toBe(true);
  });
  it("sets themes", () => {
    useReadingSettingsStore.getState().setLightTheme("parchment");
    expect(useReadingSettingsStore.getState().lightThemeId).toBe("parchment");
  });
  it("sets quran font id", () => {
    useReadingSettingsStore.getState().setQuranFontId("indopak");
    expect(useReadingSettingsStore.getState().quranFontId).toBe("indopak");
  });
  it("defaults to Uthmani", () => {
    expect(useReadingSettingsStore.getState().quranFontId).toBe("uthmani");
  });
});
