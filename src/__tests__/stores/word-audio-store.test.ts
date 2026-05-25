import { describe, it, expect, beforeEach, vi } from "vitest";

const mushafWillPlayMock = vi.fn();
const sourceDidStopMock = vi.fn();
const registerPauseHandlerMock = vi.fn();

vi.mock("@/services/audio/audio-coordinator", () => ({
  audioCoordinator: {
    mushafWillPlay: mushafWillPlayMock,
    sourceDidStop: sourceDidStopMock,
    registerPauseHandler: registerPauseHandlerMock,
  },
}));

function createMockAudio() {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const audio = {
    src: "",
    currentTime: 0,
    paused: true,
    preload: "auto",
    play: vi.fn().mockImplementation(async function (this: { paused: boolean }) {
      this.paused = false;
    }),
    pause: vi.fn().mockImplementation(function (this: { paused: boolean }) {
      this.paused = true;
    }),
    addEventListener: vi.fn((event: string, listener: (event: Event) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: (event: string) => {
      listeners.get(event)?.forEach((listener) => listener(new Event(event)));
    },
  };
  return audio;
}

let mockAudio: ReturnType<typeof createMockAudio>;

beforeEach(async () => {
  vi.resetModules();
  mushafWillPlayMock.mockClear();
  sourceDidStopMock.mockClear();
  registerPauseHandlerMock.mockClear();
  mockAudio = createMockAudio();
  vi.stubGlobal(
    "Audio",
    vi.fn(function () {
      return mockAudio;
    }),
  );
});

describe("useWordAudioStore", () => {
  it("claims mushaf playback and plays word audio", async () => {
    const { useWordAudioStore } = await import("@/stores/word-audio-store");

    await useWordAudioStore.getState().play({
      id: 1,
      position: 1,
      audio_url: "wbw/001_001_001.mp3",
      char_type_name: "word",
      code_v2: "x",
      page_number: 1,
      line_number: 1,
      text_uthmani: "ب",
      text_imlaei_simple: "b",
      qpc_uthmani_hafs: "ب",
      verse_key: "1:1",
      verse_id: 1,
      location: "1:1:1",
    });

    expect(registerPauseHandlerMock).toHaveBeenCalledWith("mushaf", expect.any(Function));
    expect(mushafWillPlayMock).toHaveBeenCalled();
    expect(mockAudio.src).toBe("https://audio.qurancdn.com/wbw/001_001_001.mp3");
    expect(mockAudio.play).toHaveBeenCalled();
    expect(useWordAudioStore.getState().activeLocation).toBe("1:1:1");
  });

  it("ignores words without audio", async () => {
    const { useWordAudioStore } = await import("@/stores/word-audio-store");

    await useWordAudioStore.getState().play({
      id: 2,
      position: 2,
      audio_url: null,
      char_type_name: "end",
      code_v2: "x",
      page_number: 1,
      line_number: 1,
      text_uthmani: "١",
      text_imlaei_simple: "1",
      qpc_uthmani_hafs: "١",
      verse_key: "1:1",
      verse_id: 1,
      location: "1:1:7",
    });

    expect(mockAudio.play).not.toHaveBeenCalled();
    expect(useWordAudioStore.getState().activeLocation).toBeNull();
  });
});
