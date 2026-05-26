/**
 * Central branding configuration.
 *
 * Forks override these values via env vars rather than grepping the
 * codebase. Anything that must change when forking (app name, deep-link
 * bundle IDs, smart-banner app IDs, source-repo URL) flows through here.
 *
 * Fields that are env-derived and optional default to `undefined`. Call
 * sites must treat `undefined` as "feature disabled" — e.g. omit the
 * apple-itunes-app smart banner entirely when `iosAppId` is unset, so a
 * fork that hasn't shipped a mobile app does not banner its users into
 * the upstream Bayaan iOS app.
 *
 * Fields that fall back to public Bayaan defaults are clearly marked.
 * Self-hosters who want clean separation should set every relevant env
 * var explicitly.
 */

export interface Branding {
  /** Display name in titles, OG, manifest. */
  appName: string;
  /** Tagline used under the app name in OG and meta description. */
  appTagline: string;
  /** Canonical site URL. Falls back to Bayaan's deployment. */
  siteUrl: string;
  /** Public Bayaan-style backend URL. Falls back to api.thebayaan.com. */
  apiUrl: string;
  /** CDN host for audio + reciter images. Falls back to cdn.thebayaan.com. */
  cdnUrl: string;
  /** Public source-repository URL, surfaced in About to satisfy AGPL §13. */
  sourceRepoUrl: string;
  /** Support / contact URL. */
  supportUrl: string;
  /** Terms URL. */
  termsUrl: string;
  /** Privacy policy URL. */
  privacyUrl: string;

  /**
   * iOS App Store numeric id. When undefined, the apple-itunes-app smart
   * banner is omitted so forks without a mobile app don't banner users
   * into the upstream Bayaan iOS app.
   */
  iosAppId: string | undefined;
  /**
   * iOS Universal-Link app argument URL (e.g. https://app.your-fork.example).
   * Falls back to `siteUrl` when set with `iosAppId`.
   */
  iosAppUrl: string | undefined;
  /**
   * Apple Developer Team ID. Required for apple-app-site-association.
   * When undefined, the AASA route returns 404.
   */
  iosTeamId: string | undefined;
  /**
   * iOS bundle identifier. Required for apple-app-site-association.
   * When undefined, the AASA route returns 404.
   */
  iosBundleId: string | undefined;
  /**
   * Android application package id. Required for assetlinks.json.
   * When undefined, the assetlinks route returns 404.
   */
  androidPackage: string | undefined;
}

function envOr(key: string, fallback: string): string {
  const v = process.env[key];
  return v && v.length > 0 ? v : fallback;
}

function envOrUndef(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

const siteUrl = envOr("NEXT_PUBLIC_SITE_URL", "https://app.thebayaan.com");

export const branding: Branding = {
  appName: envOr("NEXT_PUBLIC_APP_NAME", "Bayaan"),
  appTagline: envOr("NEXT_PUBLIC_APP_TAGLINE", "Listen to the Qur'an"),
  siteUrl,
  apiUrl: envOr("NEXT_PUBLIC_BAYAAN_API_URL", "https://api.thebayaan.com"),
  cdnUrl: envOr("NEXT_PUBLIC_BAYAAN_CDN_URL", "https://cdn.thebayaan.com"),
  sourceRepoUrl: envOr("NEXT_PUBLIC_SOURCE_REPO_URL", "https://github.com/thebayaan/bayaan-web"),
  supportUrl: envOr("NEXT_PUBLIC_SUPPORT_URL", "https://thebayaan.com/support"),
  termsUrl: envOr("NEXT_PUBLIC_TERMS_URL", "https://thebayaan.com/terms"),
  privacyUrl: envOr("NEXT_PUBLIC_PRIVACY_URL", "https://thebayaan.com/privacy"),

  iosAppId: envOrUndef("NEXT_PUBLIC_IOS_APP_ID"),
  iosAppUrl: envOrUndef("NEXT_PUBLIC_IOS_APP_URL") ?? siteUrl,
  iosTeamId: envOrUndef("APPLE_TEAM_ID"),
  iosBundleId: envOrUndef("IOS_BUNDLE_ID"),
  androidPackage: envOrUndef("ANDROID_PACKAGE_NAME"),
};
