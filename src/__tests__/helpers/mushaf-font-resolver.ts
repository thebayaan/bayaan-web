import {
  createMushafFontResolver,
  getMushafFontConfig,
  type MushafFontId,
  type MushafFontResolver,
} from "@/lib/mushaf-fonts";

export function createTestFontResolver(options?: {
  fontId?: MushafFontId;
  pageLoaded?: boolean | ((page: number) => boolean);
  fontFamily?: string | ((page: number) => string);
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

  return createMushafFontResolver(config, {
    isPageFontLoaded,
    getFontFamily,
    isStaticFontLoaded:
      config.rendering === "unicode"
        ? typeof options?.pageLoaded === "boolean"
          ? options.pageLoaded
          : false
        : true,
  });
}
