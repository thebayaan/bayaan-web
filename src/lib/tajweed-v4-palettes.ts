export type TajweedPaletteTheme = "light" | "dark" | "sepia";

const registeredPalettes = new Set<string>();

function capitalizeTheme(theme: TajweedPaletteTheme): string {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

/** Inject @font-palette-values for each per-page Tajweed V4 font family once. */
export function ensureTajweedV4FontPalettes(fontFamily: string): void {
  if (registeredPalettes.has(fontFamily)) return;
  registeredPalettes.add(fontFamily);

  const style = document.createElement("style");
  style.dataset.tajweedV4Palette = fontFamily;
  style.textContent = `
    @font-palette-values --Light-${fontFamily} {
      font-family: "${fontFamily}";
      base-palette: 0;
    }
    @font-palette-values --Dark-${fontFamily} {
      font-family: "${fontFamily}";
      base-palette: 1;
    }
    @font-palette-values --Sepia-${fontFamily} {
      font-family: "${fontFamily}";
      base-palette: 2;
    }
  `;
  document.head.appendChild(style);
}

export function getTajweedV4FontPalette(fontFamily: string, theme: TajweedPaletteTheme): string {
  return `--${capitalizeTheme(theme)}-${fontFamily}`;
}

/** Exposed only for test teardown — do not call in production code. */
export function _clearTajweedV4PalettesForTesting(): void {
  registeredPalettes.clear();
  document.querySelectorAll("style[data-tajweed-v4-palette]").forEach((node) => node.remove());
}
