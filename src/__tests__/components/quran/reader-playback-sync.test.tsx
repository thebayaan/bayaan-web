import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { ReaderPlaybackSync } from "@/components/quran/reader-playback-sync";
import { useAyahTrackerStore } from "@/stores/ayah-tracker-store";
import { usePlayerStore } from "@/stores/player-store";

const timestampLoaderSpy = vi.fn();
const ayahTrackerSpy = vi.fn();

vi.mock("@/hooks/use-timestamp-loader", () => ({
  useTimestampLoader: () => timestampLoaderSpy(),
}));

vi.mock("@/hooks/use-ayah-tracker", () => ({
  useAyahTracker: () => ayahTrackerSpy(),
}));

describe("ReaderPlaybackSync", () => {
  beforeEach(() => {
    timestampLoaderSpy.mockClear();
    ayahTrackerSpy.mockClear();
    useAyahTrackerStore.getState().clear();
    usePlayerStore.setState({
      playback: {
        isPlaying: false,
        currentTrackIndex: 0,
        positionMs: 0,
        durationMs: 0,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
  });

  it("wires timestamp loader and ayah tracker hooks", () => {
    render(<ReaderPlaybackSync surahId={2} />);
    expect(timestampLoaderSpy).toHaveBeenCalled();
    expect(ayahTrackerSpy).toHaveBeenCalled();
  });

  it("scrolls the active verse into view in reading mode", () => {
    const scrollSpy = vi.fn();
    const node = document.createElement("div");
    node.id = "2:255";
    node.scrollIntoView = scrollSpy;
    document.body.appendChild(node);

    useAyahTrackerStore.getState().setTimestamps("rw:2", 2, []);
    useAyahTrackerStore.getState().setActiveVerseKey("2:255");
    usePlayerStore.setState({
      playback: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 1000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });
    useAyahTrackerStore.setState({ trackedSurahId: 2 });

    render(<ReaderPlaybackSync surahId={2} />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    document.body.removeChild(node);
  });

  it("does not window-scroll when a mushaf scroll container is provided", () => {
    const scrollSpy = vi.fn();
    const node = document.createElement("div");
    node.id = "2:255";
    node.scrollIntoView = scrollSpy;
    document.body.appendChild(node);

    const containerRef = createRef<HTMLDivElement>();
    containerRef.current = document.createElement("div");

    useAyahTrackerStore.setState({
      activeVerseKey: "2:255",
      trackedSurahId: 2,
    });
    usePlayerStore.setState({
      playback: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 1000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });

    render(<ReaderPlaybackSync surahId={2} scrollContainerRef={containerRef} />);

    expect(scrollSpy).not.toHaveBeenCalled();
    document.body.removeChild(node);
  });

  it("ignores highlights from a different surah", () => {
    const scrollSpy = vi.fn();
    const node = document.createElement("div");
    node.id = "3:1";
    node.scrollIntoView = scrollSpy;
    document.body.appendChild(node);

    useAyahTrackerStore.setState({ activeVerseKey: "3:1", trackedSurahId: 3 });
    usePlayerStore.setState({
      playback: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 1000,
        durationMs: 60000,
        rate: 1,
        volume: 1,
        isMuted: false,
      },
    });

    render(<ReaderPlaybackSync surahId={2} />);
    expect(scrollSpy).not.toHaveBeenCalled();
    document.body.removeChild(node);
  });
});
