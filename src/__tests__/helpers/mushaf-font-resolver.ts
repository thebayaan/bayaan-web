import {
  BASMALLAH_GLYPH_PAGE,
  createMushafFontResolver,
  getMushafFontConfig,
  type MushafFontId,
  type MushafFontLoader,
  type MushafFontResolver,
} from "@/lib/mushaf-fonts";

export function createTestFontResolver(options?: {
  fontId?: MushafFontId;
  pageLoaded?: boolean | ((page: number) => boolean);
  fontFamily?: string | ((page: number) => string);
  basmallahLoaded?: boolean;
}): MushafFontResolver {
  const fontId = options?.fontId ?? "qcf_v2";
  const config = getMushafFontConfig(fontId);

  const isPageFontLoaded = (page: number): boolean => {
    if (typeof options?.pageLoaded === "function") {
      return options.pageLoaded(page);
    }
    return options?.pageLoaded ?? false;
  };

  const getFontFamily = (page: number): string => {
    if (typeof options?.fontFamily === "function") {
      return options.fontFamily(page);
    }
    if (options?.fontFamily) {
      return options.fontFamily;
    }
    return isPageFontLoaded(page) ? `p${page}-v2` : "UthmanicHafs";
  };

  const loader: MushafFontLoader = {
    isPageFontLoaded,
    getFontFamily,
    isStaticFontLoaded:
      config.rendering === "unicode"
        ? typeof options?.pageLoaded === "boolean"
          ? options.pageLoaded
          : false
        : true,
  };

  const basmallahLoader: MushafFontLoader | undefined =
    options?.basmallahLoaded === true
      ? {
          isPageFontLoaded: (page) => page === BASMALLAH_GLYPH_PAGE,
          getFontFamily: () => "p1-v2",
          isStaticFontLoaded: true,
        }
      : undefined;

  return createMushafFontResolver(config, loader, { basmallahLoader });
}
