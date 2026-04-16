# Bayaan Web Facelift — Design Spec

**Date:** 2026-04-16
**Status:** Brainstorming approved; analysis + Paper design not yet started
**Predecessor:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md`
**Successor:** To be produced via `writing-plans` skill after Paper design approval

## 1. Purpose

Level up the visual and interaction design of the Bayaan web app — a Next.js web version of the Bayaan React Native app — by drawing evidence-based patterns from Deezer (for listening surfaces) and Quran.com (for reading surfaces). The outcome of this spec is a Paper design file that, once approved, will feed one or more implementation plans.

Scope target: **reading + listening primary, with coherent refresh of the shell** (sidebar, mobile tab bar, bottom player, tokens). Settings, adhkar inner screens, Clerk auth flows, and admin/dev surfaces adopt the token refresh during implementation but do not receive bespoke Paper frames in this cycle.

## 2. Design direction

**Hybrid-contemporary devotional.** A warm, Islamic-tuned palette with Deezer-level polish on listening surfaces (album-art-forward reciter pages, refined now-playing, queue drawer, motion) and Quran.com's reading discipline (serif-forward typography, spacious ayah layout, content-first hierarchy) on reading surfaces. The product reads as one coherent system where each domain expresses itself within shared tokens — not as two bolted-together apps.

Bayaan is devotional-first: reverence wins any tie against flashiness. A Deezer-maxi aesthetic would feel wrong on the mushaf; a pure Quran.com aesthetic would waste the audio-app opportunity. Neither extreme is the target.

## 3. Non-goals

- No code changes in this cycle.
- No new features — purely visual + structural facelift of existing surfaces.
- No bespoke redesigns for: settings deep UI, adhkar inner screens, sign-in/sign-up, admin/dev surfaces. These inherit new tokens during implementation.
- No new IA — existing routes (`/quran`, `/surah/[id]`, `/reciter`, `/collection`, `/adhkar`, `/search`, `/settings`) remain. The facelift may change _what appears on each route_, not _which routes exist_.
- No "reading plans" or "mood-based reciter suggestions" — these are feature ideas that could emerge from the research; they are explicitly rejected for this cycle.

## 4. Phase structure

Four phases, hard gates between them:

### 4.1 Analysis wave

20 agents run in parallel (10 Deezer, 10 Quran.com) using the brief split in section 5. Each is dispatched as `Agent` with `subagent_type: "general-purpose"` in a single message. Each returns a structured markdown finding. Findings + screenshots are committed to git before moving on.

If the system throttles at 20 concurrent dispatches, batch 10+10.

If an agent cannot reach its target (auth wall, bot-block, 403), it writes a stub marked `BLOCKED: <reason>`. The orchestrator (me) then decides per-brief whether to retry with different tooling, swap in an alternate URL, or skip.

### 4.2 Synthesis

I read all 20 findings and produce `docs/superpowers/research/facelift/synthesis.md` (structure in section 6). This doc is the primary input to the Paper design prompt.

### 4.3 Paper design

Invoke the `paper-desktop:code-to-design` skill. Inputs: synthesis doc + references to existing components under `src/components/layout`, `src/components/player`, `src/components/quran`. Output: one Paper design file covering the frames in section 7, exported to `docs/superpowers/research/facelift/paper/`.

### 4.4 Approval gate

User reviews the Paper design. On approval, this brainstorming cycle ends and the next step is `writing-plans` to produce implementation plans. If the Paper design misses direction, one iteration is budgeted; if it still misses, a moodboard gate is inserted before a second attempt.

## 5. Analysis briefs (10 × 2)

Each brief is assigned to one agent per target. Briefs are designed to be non-overlapping.

| #   | Deezer agent                        | Quran.com agent                                                          |
| --- | ----------------------------------- | ------------------------------------------------------------------------ |
| 01  | Home / landing / IA                 | Home / IA                                                                |
| 02  | Top nav, sidebar, tab bar           | Top nav, reader chrome                                                   |
| 03  | Album + artist pages                | Surah index                                                              |
| 04  | Now-playing + queue UX              | Ayah page: typography, layout, tajweed                                   |
| 05  | Search + discovery                  | Search (verse, word, topic)                                              |
| 06  | Library / collection management     | Bookmarks + reading plans (analysis only — not a Bayaan feature, see §3) |
| 07  | Motion, transitions, loading states | Motion, transitions, loading states                                      |
| 08  | Color system, palette, dark mode    | Color system, serif choices, dark mode                                   |
| 09  | Empty states, errors, edge cases    | Empty states, errors, edge cases                                         |
| 10  | Mobile / responsive behavior        | Mobile / responsive behavior                                             |

### Per-agent prompt contract

Each agent receives:

- **Target:** `deezer.com` or `quran.com`
- **Brief:** the specific row above
- **Tools allowed:** Playwright MCP (navigate, snapshot, screenshot), Firecrawl (fallback for static scrape), Grep on local `bayaan-web/src/` to see how we handle the equivalent today
- **Output path:** `docs/superpowers/research/facelift/{deezer|quran-com}/NN-<brief-slug>.md`
- **Screenshot path:** `docs/superpowers/research/facelift/screenshots/{source}/NN-*.png`
- **Body cap:** 400 words (screenshot captions don't count)

### Required output headings

1. What the target does — 3–5 concrete bullets
2. Screenshots / selector evidence — relative paths + one-line captions
3. Transferable patterns → Bayaan — each tagged `reading`, `listening`, or `shell`
4. Do NOT copy — brand-specific or secular-music-specific bits that would be wrong for a devotional app
5. One-line verdict

## 6. Synthesis doc structure

`docs/superpowers/research/facelift/synthesis.md`:

1. **Direction statement** (≤100 words) — the section 2 vibe made concrete for this specific synthesis.
2. **Tokens** — palette (light + dark), type scale (Arabic + Latin pairings with specific font choices), spacing, radius, elevation, motion curves and durations.
3. **Per-domain moves** — table of: screen → current state → proposed change → cited finding(s).
4. **Component inventory delta** — new primitives needed (e.g., `reciter-hero`, `ayah-card`, `queue-drawer`), existing ones reskinned, ones deleted.
5. **Explicit non-goals** — ideas considered and rejected during synthesis, with reasons.
6. **Open questions for Paper phase** — short list, each a yes/no answered by the user before Paper generation.

## 7. Paper design scope

Total ~18 frames. High-fidelity unless noted.

**Shell** (desktop + mobile viewports)

- Sidebar (desktop) / mobile tab bar
- Bottom player bar (collapsed state)
- Top-right Clerk user menu area

**Reading**

- Surah index (`/quran`)
- Mushaf page view (`/surah/[id]` mushaf mode)
- Reading view — verse-by-verse with translation (`/surah/[id]` reading mode)
- Ayah focus / detail state (tap-an-ayah)

**Listening**

- Reciter index (`/reciter`)
- Reciter detail (reciter hero + surah list)
- Surah detail with audio (`/surah/[id]` listening mode)
- Full player view (expanded)
- Queue panel

**Supporting** (one frame each, lower fidelity)

- Search results
- Collection view
- Empty state example
- Loading skeleton example

Both light and dark modes for all frames. Desktop (≥1280) and mobile (≤430) for shell + the four primary reading/listening surfaces. Desktop-only is acceptable for supporting frames.

## 8. Deliverables

By the end of this brainstorming cycle:

1. `docs/superpowers/research/facelift/deezer/01..10-*.md` — 10 findings + screenshots
2. `docs/superpowers/research/facelift/quran-com/01..10-*.md` — 10 findings + screenshots
3. `docs/superpowers/research/facelift/screenshots/{deezer,quran-com}/NN-*.png`
4. `docs/superpowers/research/facelift/synthesis.md`
5. `docs/superpowers/research/facelift/paper/` — Paper file link + exported frames
6. This spec (already on disk at the header path)

## 9. Risks and mitigations

- **Deezer blocks bots.** Fallback: Firecrawl for static markup; request manual screenshots from user for any brief that can't be automated.
- **20 parallel agents exhaust context or tool budget.** Mitigation: batch 10+10 if the first dispatch throttles.
- **Paper output misses the vibe.** Mitigation: one iteration is in the budget. If the second attempt still misses, insert a moodboard gate (browser-based visual companion with palettes, type pairings, motion refs) before a third attempt.
- **Scope creep during implementation.** Mitigation: this spec is the contract for the facelift. Anything discovered later that isn't in here becomes a follow-up plan, not a quiet add-on.

## 10. Handoff

On Paper design approval, the terminal action of this brainstorming cycle is to invoke the `writing-plans` skill. Expected plan split:

- `plan-1-tokens-and-shell` — palette, typography, spacing, radius, elevation wired into Tailwind config + shell components (sidebar, mobile tab bar, bottom player bar).
- `plan-2-listening-surfaces` — reciter index, reciter detail, surah listening mode, full player, queue.
- `plan-3-reading-surfaces` — surah index, mushaf page, reading view, ayah detail.

Plans follow the same pattern as the existing `docs/superpowers/plans/2026-04-13-bayaan-web-plan-*.md` files.
