import { describe, it, expect, beforeEach } from "vitest";
import { AudioCoordinator } from "@/services/audio/audio-coordinator";

describe("AudioCoordinator", () => {
  let coordinator: AudioCoordinator;

  beforeEach(() => {
    coordinator = new AudioCoordinator();
  });

  it("starts with no active source", () => {
    expect(coordinator.getActiveSource()).toBe("none");
  });

  it("sets active source to main on mainWillPlay", () => {
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");
  });

  it("sets active source to mushaf on mushafWillPlay", () => {
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
  });

  it("switches from main to mushaf", () => {
    coordinator.mainWillPlay();
    expect(coordinator.getActiveSource()).toBe("main");
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
  });

  it("switches from mushaf to main", () => {
    coordinator.mushafWillPlay();
    expect(coordinator.getActiveSource()).toBe("mushaf");
    coordinator.mainWillPlay();
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
