export type AudioSource = "main" | "mushaf" | "adhkar" | "none";

type PlayableSource = Exclude<AudioSource, "none">;

export class AudioCoordinator {
  private activeSource: AudioSource = "none";
  private pauseHandlers: Partial<Record<PlayableSource, () => void>> = {};

  getActiveSource(): AudioSource {
    return this.activeSource;
  }

  registerPauseHandler(source: PlayableSource, handler: () => void): void {
    this.pauseHandlers[source] = handler;
  }

  private claimSource(next: PlayableSource): void {
    if (this.activeSource !== "none" && this.activeSource !== next) {
      this.pauseHandlers[this.activeSource]?.();
    }
    this.activeSource = next;
  }

  mainWillPlay(): void {
    this.claimSource("main");
  }

  mushafWillPlay(): void {
    this.claimSource("mushaf");
  }

  adhkarWillPlay(): void {
    this.claimSource("adhkar");
  }

  sourceDidStop(source: PlayableSource): void {
    if (this.activeSource === source) {
      this.activeSource = "none";
    }
  }
}

export const audioCoordinator = new AudioCoordinator();
