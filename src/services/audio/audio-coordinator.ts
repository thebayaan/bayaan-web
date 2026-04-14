export type AudioSource = "main" | "mushaf" | "none";

export class AudioCoordinator {
  private activeSource: AudioSource = "none";
  private onPauseMain: (() => void) | null = null;
  private onPauseMushaf: (() => void) | null = null;

  getActiveSource(): AudioSource {
    return this.activeSource;
  }

  registerPauseHandler(source: "main" | "mushaf", handler: () => void): void {
    if (source === "main") {
      this.onPauseMain = handler;
    } else {
      this.onPauseMushaf = handler;
    }
  }

  mainWillPlay(): void {
    if (this.activeSource === "mushaf" && this.onPauseMushaf) {
      this.onPauseMushaf();
    }
    this.activeSource = "main";
  }

  mushafWillPlay(): void {
    if (this.activeSource === "main" && this.onPauseMain) {
      this.onPauseMain();
    }
    this.activeSource = "mushaf";
  }

  sourceDidStop(source: AudioSource): void {
    if (this.activeSource === source) {
      this.activeSource = "none";
    }
  }
}

export const audioCoordinator = new AudioCoordinator();
