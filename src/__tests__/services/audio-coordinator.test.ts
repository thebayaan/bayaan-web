import { describe, it, expect, beforeEach, vi } from "vitest";
import { AudioCoordinator } from "@/services/audio/audio-coordinator";

describe("AudioCoordinator", () => {
  let coordinator: AudioCoordinator;

  beforeEach(() => {
    coordinator = new AudioCoordinator();
  });

  it("starts with no active source", () => {
    expect(coordinator.getActiveSource()).toBe("none");
  });

  it("sets active source on willPlay", () => {
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");

    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");

    coordinator.adhkarWillPlay();
    expect(coordinator.getActiveSource()).toBe("adhkar");
  });

  it("pauses the previously active source when switching", () => {
    const pauseMain = vi.fn();
    const pauseMushaf = vi.fn();
    const pauseAdhkar = vi.fn();

    coordinator.registerPauseHandler("main", pauseMain);
    coordinator.registerPauseHandler("mushaf", pauseMushaf);
    coordinator.registerPauseHandler("adhkar", pauseAdhkar);

    coordinator.adhkarWillPlay();
    coordinator.mainWillPlay();
    expect(pauseAdhkar).toHaveBeenCalledTimes(1);
    expect(pauseMain).not.toHaveBeenCalled();

    coordinator.mushafWillPlay();
    expect(pauseMain).toHaveBeenCalledTimes(1);

    coordinator.adhkarWillPlay();
    expect(pauseMushaf).toHaveBeenCalledTimes(1);
  });

  it("does not pause the same source when it claims playback again", () => {
    const pauseMain = vi.fn();
    coordinator.registerPauseHandler("main", pauseMain);

    coordinator.mainWillPlay();
    coordinator.mainWillPlay();

    expect(pauseMain).not.toHaveBeenCalled();
    expect(coordinator.getActiveSource()).toBe("main");
  });

  it("clears source on sourceDidStop", () => {
    coordinator.mainWillPlay();
    coordinator.sourceDidStop("main");
    expect(coordinator.getActiveSource()).toBe("none");
  });

  it("does not clear if a different source stops", () => {
    coordinator.mainWillPlay();
    coordinator.sourceDidStop("mushaf");
    expect(coordinator.getActiveSource()).toBe("main");
  });
});
