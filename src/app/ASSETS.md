# Brand assets

The files in this directory that render the **Bayaan** logo, wordmark, or
icon are project trademarks. AGPL-3.0-or-later licenses the _code_; it
does not license the _mark_.

Files in scope:

- `icon.svg` — the primary purple-star app icon
- `apple-icon.svg` — the iOS app-icon variant
- `favicon.ico`
- `opengraph-image.tsx` — embeds the `STAR_PATH` glyph as part of the
  generated OG image

If you fork this project and distribute it under another name, replace
each of these files with your own brand assets before publishing. See
[`/TRADEMARKS.md`](../../TRADEMARKS.md) for the full policy.

Other strings that identify the project as "Bayaan" should also be
overridden via the central [`branding`](../config/branding.ts) config
(driven by env vars such as `NEXT_PUBLIC_APP_NAME` and
`NEXT_PUBLIC_SOURCE_REPO_URL`) rather than edited inline.
