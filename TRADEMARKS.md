# Bayaan Trademark Policy

Bayaan's source code is licensed under the GNU Affero General Public License v3.0 or later. **The name "Bayaan" and the Bayaan logo are not covered by that license.** They are trademarks of the Bayaan project and are governed by this policy.

This separation is standard for open-source projects. It lets anyone study, run, and contribute to the code while preventing confusion about which builds are the official Bayaan.

---

## What this policy covers

- The word mark **"Bayaan"** (including common variations like "Bayaan App").
- The Bayaan logo, app icon, splash screen artwork, and any associated brand marks. See [`src/app/ASSETS.md`](src/app/ASSETS.md) for the specific files in this repo.
- Any stylized use of "Bayaan" that suggests the project endorses a product, fork, or service.

---

## What forks and derivatives **must** do

If you fork, modify, or redistribute Bayaan, you must:

1. **Choose a new name.** Your fork cannot be called "Bayaan", "Bayaan 2", "Bayaan Plus", "New Bayaan", "Bayaan Pro", or any confusingly similar variant. Set `NEXT_PUBLIC_APP_NAME` (and `NEXT_PUBLIC_APP_TAGLINE` if you change the tagline) so the new name flows into page titles, OG, manifest, and About copy automatically via [`src/config/branding.ts`](src/config/branding.ts).
2. **Use your own icons and brand artwork.** Replace `src/app/icon.svg`, `src/app/apple-icon.svg`, `src/app/favicon.ico`, the `STAR_PATH` glyph in `src/app/opengraph-image.tsx`, and the wordmark text in `src/components/layout/top-bar.tsx`. You may not ship builds using the original Bayaan icons. See [`src/app/ASSETS.md`](src/app/ASSETS.md) for the canonical list.
3. **Use your own bundle identifier and Team ID.** Change `IOS_BUNDLE_ID`, `APPLE_TEAM_ID`, and `ANDROID_PACKAGE_NAME` away from `com.bayaan.app` (the universal-link routes at `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` automatically return 404 if these are unset, so the upstream Bayaan iOS/Android app cannot claim deep links into your fork's domain).
4. **Do not banner users into the upstream Bayaan iOS app.** Leave `NEXT_PUBLIC_IOS_APP_ID` unset unless you have shipped your own iOS app, otherwise visitors on iOS get the `apple-itunes-app` smart banner pointing at the official Bayaan listing.
5. **Set `NEXT_PUBLIC_SOURCE_REPO_URL`** to _your_ fork's public source so the AGPL §13 link in About points at the code you are running, not at the upstream Bayaan repo.
6. **Remove or replace brand strings.** Anything that grep finds for "Bayaan" outside `branding.ts` overrides and the legal/governance files (LICENSE, CODE_OF_CONDUCT, SECURITY, GOVERNANCE, TRADEMARKS, CHANGELOG, THIRD_PARTY_LICENSES) should be checked.
7. **Comply with the AGPL.** The code license applies whether or not you comply with this policy; this policy is additional.

### Strings already wired through `branding.ts`

Once you set the env vars in step 1–5, these surfaces update automatically:

| Surface                                          | Env var                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `<title>`, OG `siteName`, OG/Twitter card titles | `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_TAGLINE`                             |
| `metadataBase`, sitemap, robots, OG image origin | `NEXT_PUBLIC_SITE_URL`                                                        |
| Reciter catalogue + audio backend                | `NEXT_PUBLIC_BAYAAN_API_URL`, `BAYAAN_INTERNAL_API_URL`                       |
| Audio + reciter-image CDN                        | `NEXT_PUBLIC_BAYAAN_CDN_URL`                                                  |
| "View source" link in About                      | `NEXT_PUBLIC_SOURCE_REPO_URL`                                                 |
| Support / Terms / Privacy links                  | `NEXT_PUBLIC_SUPPORT_URL`, `NEXT_PUBLIC_TERMS_URL`, `NEXT_PUBLIC_PRIVACY_URL` |
| iOS smart banner                                 | `NEXT_PUBLIC_IOS_APP_ID`, `NEXT_PUBLIC_IOS_APP_URL`                           |
| Universal-link bundle ids                        | `APPLE_TEAM_ID`, `IOS_BUNDLE_ID`, `ANDROID_PACKAGE_NAME`                      |

Any string the codebase still hardcodes as "Bayaan" outside this list is a bug — please open a PR.

---

## What you **may** do without asking

You do not need permission to:

- Refer to "Bayaan" by name when reviewing, writing about, tutorial-ing, or critiquing the project (nominative fair use).
- State accurately that your fork is "based on Bayaan" or "forked from Bayaan," as long as it is clear your fork is not the original and not endorsed by the Bayaan project.
- Use the Bayaan name in academic, journalistic, or educational contexts.
- Link to the official Bayaan repository or website.

---

## What you **may not** do

- Ship a product, app, service, or website that uses "Bayaan" in its name or branding without written permission.
- Use the Bayaan logo or icons in your own product's marketing, app listings, or UI.
- Imply that your fork is endorsed by, affiliated with, or maintained by the Bayaan project.
- Register domain names, social media handles, or trademarks containing "Bayaan" that could be confused with the official project.
- Monetize products or services that use the Bayaan name or logo.

---

## Requesting permission

If you would like to use the Bayaan name or logo for a purpose not permitted above — for example, a community event, a translation partnership, or an officially-endorsed fork — open a GitHub issue or contact the maintainers.

Permission is granted case-by-case in writing. A "no" today is not a "yes" tomorrow; do not assume prior grants extend to new uses.

---

## Enforcement

The Bayaan project reserves the right to:

- Request that App Store and Play Store listings using the Bayaan name or logo be removed.
- File DMCA notices and trademark complaints against infringing products.
- Pursue the remedies available to trademark holders under applicable law.

Most conflicts are resolved amicably when people understand the policy. If you are unsure whether your use is permitted, ask first.

---

## Precedent

This policy follows the pattern used by established open-source projects that separate code licensing from brand protection — most notably Mozilla (Firefox), Signal, Element, and the Linux Foundation. The underlying principle is the same: the code is free, the name is not.
