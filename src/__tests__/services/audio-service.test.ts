import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock HTMLAudioElement
function createMockAudio() {
  const audio = {
    src: "",
    currentTime: 0,
    duration: 120,
    paused: true,
    volume: 1,
    muted: false,
    playbackRate: 1,
    readyState: 0,
    buffered: { length: 0, start: vi.fn(), end: vi.fn() },
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return audio;
}

// We test the AudioService by importing it after mocking
let AudioService: typeof import("@/services/audio/audio-service").AudioService;
let mockAudio: ReturnType<typeof createMockAudio>;

beforeEach(async () => {
  vi.resetModules();
  mockAudio = createMockAudio();
  vi.stubGlobal(
    "Audio",
    vi.fn(function () {
      return mockAudio;
    }),
  );
  const mod = await import("@/services/audio/audio-service");
  AudioService = mod.AudioService;
});

describe("AudioService", () => {
  it("is a singleton", () => {
    const a = AudioService.getInstance();
    const b = AudioService.getInstance();
    expect(a).toBe(b);
  });

  it("loads a track by setting src", () => {
    const service = AudioService.getInstance();
    service.load("https://cdn.thebayaan.com/quran/001.mp3");
    expect(mockAudio.src).toBe("https://cdn.thebayaan.com/quran/001.mp3");
  });

  it("calls audio.play() on play", async () => {
    const service = AudioService.getInstance();
    service.load("https://cdn.thebayaan.com/quran/001.mp3");
    await service.play();
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("calls audio.pause() on pause", () => {
    const service = AudioService.getInstance();
    service.pause();
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("seeks to a position in seconds", () => {
    const service = AudioService.getInstance();
    service.seek(30);
    expect(mockAudio.currentTime).toBe(30);
  });

  it("clamps playback rate to 0.5-2.0", () => {
    const service = AudioService.getInstance();
    service.setRate(3);
    expect(mockAudio.playbackRate).toBe(2);
    service.setRate(0.1);
    expect(mockAudio.playbackRate).toBe(0.5);
    service.setRate(1.5);
    expect(mockAudio.playbackRate).toBe(1.5);
  });

  it("clamps volume to 0-1", () => {
    const service = AudioService.getInstance();
    service.setVolume(1.5);
    expect(mockAudio.volume).toBe(1);
    service.setVolume(-0.5);
    expect(mockAudio.volume).toBe(0);
    service.setVolume(0.7);
    expect(mockAudio.volume).toBe(0.7);
  });

  it("toggles muted state", () => {
    const service = AudioService.getInstance();
    service.setMuted(true);
    expect(mockAudio.muted).toBe(true);
    service.setMuted(false);
    expect(mockAudio.muted).toBe(false);
  });

  it("reports current playback state", () => {
    const service = AudioService.getInstance();
    mockAudio.currentTime = 42;
    mockAudio.duration = 120;
    mockAudio.paused = false;
    expect(service.getCurrentTime()).toBe(42);
    expect(service.getDuration()).toBe(120);
    expect(service.getIsPlaying()).toBe(true);
  });
});
