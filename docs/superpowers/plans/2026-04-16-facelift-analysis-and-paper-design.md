# Facelift — Analysis + Paper Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an approved Paper design for the Bayaan web facelift, grounded in 20 parallel research briefs across Deezer and Quran.com, via a synthesis document.

**Architecture:** Three sequential phases with hard gates between them. Phase 1 — 20 agents run in parallel, each completing one analytical brief, writing a structured markdown finding plus screenshots. Phase 2 — single-author synthesis that consolidates findings into a concrete design direction. Phase 3 — invocation of `paper-desktop:code-to-design` to produce a Paper file with ~18 frames. Each phase gate requires the previous artifact on disk, committed.

**Tech Stack:** Agent tool (`subagent_type: general-purpose`), Playwright MCP (`mcp__plugin_playwright_playwright__*`), Firecrawl (fallback), Paper Desktop MCP (`paper-desktop:code-to-design`), git.

**TDD note:** This plan is research + design, not code. There is no automated test equivalent. Each phase gate is human approval of a concrete artifact. Do not fabricate tests. Do not skip the human gates.

**Spec:** `docs/superpowers/specs/2026-04-16-facelift-design.md`

---

## File Structure

Files created by this plan:

**Research directory scaffold**

- `docs/superpowers/research/facelift/README.md` — brief process doc for future contributors
- `docs/superpowers/research/facelift/deezer/` — 10 finding files
- `docs/superpowers/research/facelift/quran-com/` — 10 finding files
- `docs/superpowers/research/facelift/screenshots/deezer/` — evidence PNGs
- `docs/superpowers/research/facelift/screenshots/quran-com/` — evidence PNGs

**Deezer findings** (written by agents in Task 2)

- `docs/superpowers/research/facelift/deezer/01-home-landing-ia.md`
- `docs/superpowers/research/facelift/deezer/02-nav-sidebar-tabbar.md`
- `docs/superpowers/research/facelift/deezer/03-album-artist-pages.md`
- `docs/superpowers/research/facelift/deezer/04-now-playing-queue.md`
- `docs/superpowers/research/facelift/deezer/05-search-discovery.md`
- `docs/superpowers/research/facelift/deezer/06-library-collection.md`
- `docs/superpowers/research/facelift/deezer/07-motion-loading.md`
- `docs/superpowers/research/facelift/deezer/08-color-dark-mode.md`
- `docs/superpowers/research/facelift/deezer/09-empty-errors-edges.md`
- `docs/superpowers/research/facelift/deezer/10-mobile-responsive.md`

**Quran.com findings** (written by agents in Task 2)

- `docs/superpowers/research/facelift/quran-com/01-home-ia.md`
- `docs/superpowers/research/facelift/quran-com/02-nav-reader-chrome.md`
- `docs/superpowers/research/facelift/quran-com/03-surah-index.md`
- `docs/superpowers/research/facelift/quran-com/04-ayah-typography-tajweed.md`
- `docs/superpowers/research/facelift/quran-com/05-search.md`
- `docs/superpowers/research/facelift/quran-com/06-bookmarks-reading-plans.md`
- `docs/superpowers/research/facelift/quran-com/07-motion-loading.md`
- `docs/superpowers/research/facelift/quran-com/08-color-serifs-dark-mode.md`
- `docs/superpowers/research/facelift/quran-com/09-empty-errors-edges.md`
- `docs/superpowers/research/facelift/quran-com/10-mobile-responsive.md`

**Synthesis**

- `docs/superpowers/research/facelift/synthesis.md`

**Paper design output**

- `docs/superpowers/research/facelift/paper/LINK.md` — Paper file URL + metadata
- `docs/superpowers/research/facelift/paper/frames/*.png` — exported frames

Each task below produces self-contained changes that make sense independently. Commits are frequent so if a phase fails we can resume from the last green state.

---

## Task 1: Scaffold research directories and process README

**Files:**

- Create: `docs/superpowers/research/facelift/README.md`
- Create: `docs/superpowers/research/facelift/deezer/.gitkeep`
- Create: `docs/superpowers/research/facelift/quran-com/.gitkeep`
- Create: `docs/superpowers/research/facelift/screenshots/deezer/.gitkeep`
- Create: `docs/superpowers/research/facelift/screenshots/quran-com/.gitkeep`

- [ ] **Step 1: Create the directory README**

Write `docs/superpowers/research/facelift/README.md` with this exact content:

```markdown
# Facelift Research

Evidence-based analysis of Deezer and Quran.com to inform the Bayaan web facelift design.

## Layout

- `deezer/NN-<slug>.md` — one Deezer analysis brief per file, numbered 01–10
- `quran-com/NN-<slug>.md` — one Quran.com analysis brief per file, numbered 01–10
- `screenshots/{deezer,quran-com}/NN-*.png` — evidence images referenced by findings
- `synthesis.md` — consolidated design direction produced from all 20 findings
- `paper/` — links to and exported frames from the Paper design file

## Provenance

Produced by the plan at `docs/superpowers/plans/2026-04-16-facelift-analysis-and-paper-design.md`, based on the spec at `docs/superpowers/specs/2026-04-16-facelift-design.md`.

## Finding file structure

Each finding is ≤400 words (body; screenshot captions excluded) with five fixed headings:

1. What the target does — 3–5 concrete bullets
2. Screenshots / selector evidence — relative paths + one-line captions
3. Transferable patterns → Bayaan — each tagged `reading`, `listening`, or `shell`
4. Do NOT copy — brand-specific or secular-music-specific bits
5. One-line verdict
```

- [ ] **Step 2: Create empty directories with .gitkeep placeholders**

Run:

```bash
mkdir -p docs/superpowers/research/facelift/deezer \
         docs/superpowers/research/facelift/quran-com \
         docs/superpowers/research/facelift/screenshots/deezer \
         docs/superpowers/research/facelift/screenshots/quran-com
touch docs/superpowers/research/facelift/deezer/.gitkeep \
      docs/superpowers/research/facelift/quran-com/.gitkeep \
      docs/superpowers/research/facelift/screenshots/deezer/.gitkeep \
      docs/superpowers/research/facelift/screenshots/quran-com/.gitkeep
```

- [ ] **Step 3: Verify directory structure**

Run: `find docs/superpowers/research/facelift -type d | sort`

Expected output:

```
docs/superpowers/research/facelift
docs/superpowers/research/facelift/deezer
docs/superpowers/research/facelift/quran-com
docs/superpowers/research/facelift/screenshots
docs/superpowers/research/facelift/screenshots/deezer
docs/superpowers/research/facelift/screenshots/quran-com
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/research/facelift
git commit -m "chore(research): scaffold facelift research directories"
```

---

## Task 2: Dispatch 20 parallel analysis agents

**Files:**

- Output: 20 files under `docs/superpowers/research/facelift/{deezer,quran-com}/NN-*.md`
- Output: screenshots under `docs/superpowers/research/facelift/screenshots/{deezer,quran-com}/NN-*.png`

**Important:** This task is a single message with 20 parallel `Agent` tool calls. If the tool-dispatch layer throttles, split into two messages of 10 (all Deezer first, then Quran.com — do not serialize individual agents).

- [ ] **Step 1: Confirm Playwright MCP is available**

Run the sanity check: attempt `mcp__plugin_playwright_playwright__browser_navigate` to `about:blank`. If it returns InputValidationError because the schema isn't loaded, run `ToolSearch` with query `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_take_screenshot,mcp__plugin_playwright_playwright__browser_close` before dispatching agents — otherwise sub-agents cannot use it either.

- [ ] **Step 2: Dispatch all 20 agents in one message**

Use 20 `Agent` tool calls in one response. Every agent uses `subagent_type: "general-purpose"` and receives the prompt template below with the brief-specific fields substituted.

**Per-agent prompt template (substitute `{TARGET_DOMAIN}`, `{TARGET_URL}`, `{BRIEF_NUMBER}`, `{BRIEF_SLUG}`, `{BRIEF_NAME}`, `{BRIEF_GUIDANCE}`):**

```
You are analyzing the {TARGET_DOMAIN} web app for the Bayaan facelift research wave. Your brief is: {BRIEF_NAME}.

Context: Bayaan is a devotional Islamic web app (Quran reader + reciter audio + adhkar) at /Users/osmansaeday/theBayaan/bayaan-web. It's a Next.js 16 / React 19 / Tailwind 4 / shadcn+base-ui / framer-motion app. Your job is to find what {TARGET_DOMAIN} does well within your brief's scope, so we can borrow patterns — not brand, not copy.

Brief guidance: {BRIEF_GUIDANCE}

Steps:

1. Use Playwright MCP (mcp__plugin_playwright_playwright__browser_navigate, browser_snapshot, browser_take_screenshot) to explore {TARGET_URL} and any immediately-linked sub-pages within your brief's scope. If Playwright fails (auth wall, bot-block, timeout), fall back to Firecrawl for static markup extraction. If both fail, write a stub finding marked "BLOCKED: <reason>" and stop.

2. Take 2–5 screenshots that show the patterns you're calling out. Save them to: docs/superpowers/research/facelift/screenshots/{TARGET_SLUG}/{BRIEF_NUMBER}-<descriptor>.png (where {TARGET_SLUG} is "deezer" or "quran-com").

3. Use Grep on /Users/osmansaeday/theBayaan/bayaan-web/src/ to see how Bayaan currently handles the Bayaan-equivalent surfaces. This shapes your "transferable patterns" section — recommend what specifically changes.

4. Write your finding to: docs/superpowers/research/facelift/{TARGET_SLUG}/{BRIEF_NUMBER}-{BRIEF_SLUG}.md

Finding file MUST use these five headings exactly, in this order:

# Brief {BRIEF_NUMBER} — {BRIEF_NAME}

**Target:** {TARGET_URL}
**Date:** 2026-04-16

## 1. What the target does

(3–5 concrete bullets. No fluff. Name real components, layouts, and interactions you observed.)

## 2. Screenshots / selector evidence

(Relative paths to screenshots in the screenshots/ directory, each with a one-line caption. CSS selectors welcome where they clarify.)

## 3. Transferable patterns → Bayaan

(Each bullet tagged `[reading]`, `[listening]`, or `[shell]`. Be specific about which Bayaan surface you'd apply this to and what concrete change you'd make.)

## 4. Do NOT copy

(Brand-specific or secular-music-specific bits that would be inappropriate for a devotional app. Be concrete — avoid generic warnings.)

## 5. One-line verdict

(One sentence. The single most important takeaway.)

Hard limits:
- Body cap: 400 words total across sections 1+3+4+5. Screenshot captions don't count.
- Do NOT propose Bayaan features that don't already exist in the codebase. Your job is visual/interaction evidence, not product design.
- Do NOT read other agents' findings or the synthesis doc — they don't exist yet.
- Do NOT edit any file outside docs/superpowers/research/facelift/.

Return to me only the path to your finding file and a one-line confirmation. I don't need the finding content in your reply.
```

**The 20 agent dispatches** — use these exact brief definitions:

### Deezer agents (TARGET_DOMAIN: "Deezer", TARGET_SLUG: "deezer", TARGET_URL base: "https://www.deezer.com")

| #   | BRIEF_SLUG         | BRIEF_NAME                          | BRIEF_GUIDANCE                                                                                                                                                                 |
| --- | ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01  | home-landing-ia    | Home / landing / IA                 | Analyze Deezer's home page and overall information architecture. What's the landing surface? How do top-level sections group? Where does a new user go first?                  |
| 02  | nav-sidebar-tabbar | Top nav, sidebar, tab bar           | Study the persistent navigation — sidebar on desktop, mobile tab bar. Item ordering, icon treatment, active state, collapse behavior.                                          |
| 03  | album-artist-pages | Album + artist pages                | Hero design, metadata hierarchy, tracklist rendering, play-all affordances, related-content rails. Treat these as the analog of Bayaan's reciter page + surah-with-audio page. |
| 04  | now-playing-queue  | Now-playing + queue UX              | Bottom player bar (collapsed + expanded), full-screen now-playing, queue panel. Progress, seek, volume, shuffle/repeat, art treatment.                                         |
| 05  | search-discovery   | Search + discovery                  | Search input behavior, results grouping, suggestion UI, empty-search state, browse-by-genre surfaces.                                                                          |
| 06  | library-collection | Library / collection management     | User's saved content — playlists, favorites, history. How are lists organized, edited, sorted, shared?                                                                         |
| 07  | motion-loading     | Motion, transitions, loading states | Page transitions, hover/press microinteractions, skeleton loaders, progress feedback, easing curves.                                                                           |
| 08  | color-dark-mode    | Color system, palette, dark mode    | Palette tokens, gradient usage, dark-mode specifics, album-art-driven dynamic color.                                                                                           |
| 09  | empty-errors-edges | Empty states, errors, edge cases    | Zero-state library, failed audio, offline, rate-limited search, account-required gates.                                                                                        |
| 10  | mobile-responsive  | Mobile / responsive behavior        | Breakpoint strategy, touch target sizing, mobile-specific patterns (swipeable queue, sticky player), viewport transitions.                                                     |

### Quran.com agents (TARGET_DOMAIN: "Quran.com", TARGET_SLUG: "quran-com", TARGET_URL base: "https://quran.com")

| #   | BRIEF_SLUG              | BRIEF_NAME                              | BRIEF_GUIDANCE                                                                                                                                                       |
| --- | ----------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | home-ia                 | Home / IA                               | Landing page layout, primary CTAs, surah/juz switcher, recent-reading pickup, top-level IA.                                                                          |
| 02  | nav-reader-chrome       | Top nav, reader chrome                  | Top bar persistence, settings affordance (reciter, translation, script), breadcrumbs, chapter navigation.                                                            |
| 03  | surah-index             | Surah index                             | Surah list page — list vs. grid, metadata per row (revelation place, ayah count), juz grouping, filter/search.                                                       |
| 04  | ayah-typography-tajweed | Ayah page — typography, layout, tajweed | Arabic font choice, line-height, word spacing, per-word color tajweed, translation rendering, verse number treatment.                                                |
| 05  | search                  | Search — verse, word, topic             | Query modes, results layout, in-context highlighting, topic tagging.                                                                                                 |
| 06  | bookmarks-reading-plans | Bookmarks + reading plans               | Bookmark creation, notes attached to verses, reading-plan UI. (Analysis only — Bayaan rejects reading plans as a feature; we study the reading-progress UI pattern.) |
| 07  | motion-loading          | Motion, transitions, loading states     | Page transitions (especially ayah-to-ayah), audio-sync animations, skeleton loaders.                                                                                 |
| 08  | color-serifs-dark-mode  | Color system, serifs, dark mode         | Palette tokens, Arabic serif family, Latin pairing, dark-mode parchment treatment, mushaf-style color.                                                               |
| 09  | empty-errors-edges      | Empty states, errors, edge cases        | First-time reader, missing translation, audio load failure, deep-link to invalid ayah.                                                                               |
| 10  | mobile-responsive       | Mobile / responsive behavior            | Mushaf-on-mobile, portrait vs. landscape, bottom-sheet settings, touch targets on dense verse lists.                                                                 |

- [ ] **Step 3: Wait for all 20 agents to return and collect their output paths**

Expected: 20 return messages, each with a finding file path and confirmation. Any agent returning "BLOCKED:" content is flagged for Task 3.

- [ ] **Step 4: Verify all 20 finding files exist on disk**

Run:

```bash
ls docs/superpowers/research/facelift/deezer/*.md | wc -l
ls docs/superpowers/research/facelift/quran-com/*.md | wc -l
```

Expected: `10` and `10`. If either is less, note which briefs are missing and proceed to Task 3.

---

## Task 3: Handle BLOCKED briefs

**Files:**

- Modify: any finding file marked "BLOCKED:" in section 5

- [ ] **Step 1: Identify all blocked findings**

Run:

```bash
grep -l "^BLOCKED:" docs/superpowers/research/facelift/deezer/*.md docs/superpowers/research/facelift/quran-com/*.md 2>/dev/null
```

Expected: zero or more file paths. If zero, skip to Task 4.

- [ ] **Step 2: For each blocked file, choose a recovery path**

Read the file and the stated block reason. Pick one of:

- **Retry with Firecrawl** — redispatch one `Agent` with the same brief but forcing Firecrawl-only (Playwright unavailable). Acceptable if the block was Playwright-specific (bot detection on headless Chrome).
- **Swap target URL** — if the home page blocked but a sub-page is reachable, redispatch with the sub-page as TARGET_URL.
- **Request manual screenshots from user** — if both tools fail. Ask the user to provide 2–5 screenshots of the target surface and attach them to the finding manually. Ask in the form: "Brief NN (<name>) is blocked by <reason>. Can you send 2–5 screenshots of <specific surface>?"
- **Skip with explanation** — if no recovery is possible, leave the stub in place with a one-line explanation in section 5 and a note in the synthesis doc (Task 5) that this brief was dropped. This is acceptable for at most 2 of the 20 briefs; more than that fails Task 3 and the plan must be paused.

- [ ] **Step 3: Verify recovery complete**

Re-run the grep from Step 1. Expected: 0 lines unless briefs were explicitly skipped.

---

## Task 4: Commit all findings and screenshots

**Files:**

- Add: `docs/superpowers/research/facelift/deezer/*.md`
- Add: `docs/superpowers/research/facelift/quran-com/*.md`
- Add: `docs/superpowers/research/facelift/screenshots/**/*.png`

- [ ] **Step 1: Stage the research artifacts**

```bash
git add docs/superpowers/research/facelift/deezer \
        docs/superpowers/research/facelift/quran-com \
        docs/superpowers/research/facelift/screenshots
```

- [ ] **Step 2: Verify what's staged**

Run: `git status`

Expected: 20 new finding `.md` files staged, plus screenshot PNGs. Nothing outside `docs/superpowers/research/facelift/`.

If anything outside that directory is staged, unstage it with `git restore --staged <path>` and investigate — agents should not have touched other files.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
docs(research): add Deezer + Quran.com facelift analysis findings

20 parallel agents produced structured findings on both targets across
10 non-overlapping briefs each. Covers IA, navigation, content pages,
player/reader UX, search, collections, motion, color, edge cases, and
responsive behavior. Evidence screenshots committed alongside.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Write the synthesis document

**Files:**

- Create: `docs/superpowers/research/facelift/synthesis.md`

- [ ] **Step 1: Read all 20 findings end to end**

Read every file under `docs/superpowers/research/facelift/deezer/` and `docs/superpowers/research/facelift/quran-com/` in order. Hold them in context together — cross-referencing between briefs is how the synthesis gets its leverage.

- [ ] **Step 2: Write the synthesis using this exact structure**

Create `docs/superpowers/research/facelift/synthesis.md` with six numbered sections, in this order:

```markdown
# Bayaan Facelift — Synthesis

**Date:** 2026-04-16
**Spec:** `../../specs/2026-04-16-facelift-design.md`
**Findings:** `./deezer/`, `./quran-com/`

## 1. Direction statement

(≤100 words. Make the spec's "hybrid-contemporary devotional" vibe concrete for this synthesis. Name the emotional target in one paragraph.)

## 2. Tokens

### Palette — light

(Name, hex, role. Minimum: surface, surface-raised, surface-sunken, text-primary, text-secondary, accent, accent-foreground, border, success, warning, danger.)

### Palette — dark

(Same roles, dark values.)

### Typography

(Arabic family + fallback stack, Latin body family + fallback, Latin display family + fallback. Full type scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl with line-heights. Note where each is used.)

### Spacing + radius + elevation

(Spacing scale in a single row. Radius scale. Elevation/shadow scale with specific rgba values.)

### Motion

(Easing curves, duration ramps — instant, fast, medium, slow. When to use each.)

## 3. Per-domain moves

Table: screen → current state → proposed change → cited finding(s).

One row per screen in the spec's Paper scope (§7). Each proposed change is concrete ("replace gray border with 1px inner stroke matching accent at 12% opacity"). Each cites at least one finding file path.

## 4. Component inventory delta

### New primitives needed

(List with one-line purpose.)

### Existing components reskinned

(List component file paths with what changes.)

### Components to delete

(If any.)

## 5. Explicit non-goals

(Ideas the findings suggested that we considered and rejected, with one-line reasons each.)

## 6. Open questions for Paper phase

(Short list. Each a yes/no question the user answers before Paper generation.)
```

- [ ] **Step 3: Verify synthesis quality against self-checklist**

Before committing, re-read your synthesis and answer yes to all of these:

- Section 1 is a single paragraph ≤100 words, no corporate jargon.
- Section 2 has complete light AND dark palettes, no "TBD" tokens.
- Section 3's table has one row per screen in the spec's §7 Paper scope.
- Every "proposed change" in section 3 is specific enough that a designer could execute it without asking follow-up questions.
- Every change in section 3 cites at least one finding file path.
- Section 6's open questions are all yes/no answerable, not open-ended.

If any answer is no, revise before proceeding.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/research/facelift/synthesis.md
git commit -m "docs(research): synthesize facelift design direction from 20 findings"
```

---

## Task 6: User review of synthesis (gate 1)

- [ ] **Step 1: Present the synthesis to the user**

Write a message to the user with:

- Path to synthesis: `docs/superpowers/research/facelift/synthesis.md`
- One-paragraph summary of the direction statement (section 1, verbatim or tight paraphrase)
- The open questions from section 6, each posed as a yes/no prompt

Wait for the user's response. Do not proceed to Task 7 without explicit approval and answers to open questions.

- [ ] **Step 2: Incorporate user feedback**

If the user requested changes to the synthesis or answered the open questions, update the synthesis doc inline. Commit the changes:

```bash
git add docs/superpowers/research/facelift/synthesis.md
git commit -m "docs(research): address user review of synthesis"
```

If the user approved without changes, skip the commit.

---

## Task 7: Invoke Paper desktop to generate the design

**Files:**

- Create: `docs/superpowers/research/facelift/paper/LINK.md`
- Create: `docs/superpowers/research/facelift/paper/frames/*.png`

- [ ] **Step 1: Verify Paper Desktop is running**

Ask the user: "Is Paper Desktop running with a file open? The `code-to-design` skill needs it. If not, please launch it and open a new file, then reply 'ready'."

Wait for the "ready" response. Do not continue until confirmed — the MCP connection will fail otherwise.

- [ ] **Step 2: Invoke the paper-desktop:code-to-design skill**

Use the `Skill` tool with `skill: "paper-desktop:code-to-design"`. Pass a prompt containing:

- The full content of `docs/superpowers/research/facelift/synthesis.md`
- Pointers to existing token/component files to respect: `tailwind.config.ts`, `src/app/globals.css`, `src/components/layout/`, `src/components/player/`, `src/components/quran/`
- The list of frames required (from spec §7, reproduced below):

```
Frames to generate (both light + dark; desktop ≥1280 + mobile ≤430 for shell + primary surfaces):

Shell:
- Sidebar (desktop) + mobile tab bar
- Bottom player bar (collapsed)
- Top-right user menu area (Clerk)

Reading:
- Surah index (/quran)
- Mushaf page view (/surah/[id] mushaf mode)
- Reading view — verse + translation (/surah/[id] reading mode)
- Ayah focus / detail state

Listening:
- Reciter index (/reciter)
- Reciter detail (hero + surah list)
- Surah detail listening mode
- Full player view
- Queue panel

Supporting (desktop-only, lower fidelity OK):
- Search results
- Collection view
- Empty state example
- Loading skeleton example
```

The skill will read the Bayaan codebase's tokens, create a new Paper artboard, and build the frames using the actual Bayaan design language (as refined by the synthesis).

- [ ] **Step 3: Export frames from Paper**

Once Paper generates the frames, export each as PNG into `docs/superpowers/research/facelift/paper/frames/`. Use descriptive names matching the frame list: `shell-sidebar-desktop-light.png`, `reading-mushaf-mobile-dark.png`, etc.

- [ ] **Step 4: Create the LINK.md pointer**

Write `docs/superpowers/research/facelift/paper/LINK.md`:

```markdown
# Paper Design

**File:** <Paper URL pasted by user or skill>
**Created:** 2026-04-16
**Source synthesis:** `../synthesis.md`

## Frames

List of exported frames in `./frames/`, grouped by section (Shell / Reading / Listening / Supporting).
```

Populate the frames list based on what was actually exported.

- [ ] **Step 5: Commit Paper artifacts**

```bash
git add docs/superpowers/research/facelift/paper
git commit -m "feat(design): generate Paper design from synthesis"
```

---

## Task 8: User review of Paper design (gate 2 — final approval)

- [ ] **Step 1: Present the Paper design to the user**

Write a message to the user with:

- Paper file URL (from `paper/LINK.md`)
- Count of frames generated, grouped by section
- A short statement: "Reviewing Paper is a visual task — please open the file and let me know: approve as-is, approve with minor comments, or revise."

Wait for response.

- [ ] **Step 2: Handle the response**

- **Approve as-is:** proceed to Task 9.
- **Approve with minor comments:** note the comments, proceed to Task 9 — downstream implementation plans will honor them.
- **Revise:** re-run `paper-desktop:code-to-design` with updated instructions. If it misses a second time, insert a moodboard gate (browser-based palette/type/motion companion, per spec §9) before a third attempt. Return to Task 7 step 2 after adjustments.

- [ ] **Step 3: Record the approval outcome**

Append to `docs/superpowers/research/facelift/paper/LINK.md`:

```markdown
## Approval

**Status:** Approved / Approved with comments / Revised N times
**Date:** 2026-04-16
**Comments:** <user's comments verbatim, or "none">
```

Commit:

```bash
git add docs/superpowers/research/facelift/paper/LINK.md
git commit -m "docs(design): record Paper approval outcome"
```

---

## Task 9: Transition to implementation planning

This plan is complete. The terminal action is to invoke `writing-plans` again to produce the three downstream implementation plans:

- `plan-1-tokens-and-shell` — palette, typography, spacing, radius, elevation wired into Tailwind + shell components
- `plan-2-listening-surfaces` — reciter index, reciter detail, surah listening mode, full player, queue
- `plan-3-reading-surfaces` — surah index, mushaf page, reading view, ayah detail

- [ ] **Step 1: Confirm prerequisite artifacts exist**

Run:

```bash
test -f docs/superpowers/research/facelift/synthesis.md && \
test -f docs/superpowers/research/facelift/paper/LINK.md && \
grep -qF "**Status:** Approved" docs/superpowers/research/facelift/paper/LINK.md && \
echo "ready to plan implementation"
```

Expected output: `ready to plan implementation`. If not, do not proceed — something is missing or the Paper design was not approved.

- [ ] **Step 2: Invoke writing-plans for each downstream plan**

Invoke the `Skill` tool with `skill: "superpowers:writing-plans"` three times (or once, consolidating if scope stays small). Each invocation's spec input is the synthesis + Paper LINK.md + the specific domain (tokens/shell, listening, reading).

Produce:

- `docs/superpowers/plans/2026-MM-DD-facelift-plan-1-tokens-and-shell.md`
- `docs/superpowers/plans/2026-MM-DD-facelift-plan-2-listening-surfaces.md`
- `docs/superpowers/plans/2026-MM-DD-facelift-plan-3-reading-surfaces.md`

Those plans — not this one — handle the actual code changes.

---

## Self-review notes

**Spec coverage:**

- §4.1 Analysis wave → Tasks 2, 3
- §4.2 Synthesis → Task 5
- §4.3 Paper design → Task 7
- §4.4 Approval gate → Tasks 6, 8
- §5 Briefs → Task 2 step 2 (prompt template + 20-row table)
- §6 Synthesis structure → Task 5 step 2 (exact headings reproduced)
- §7 Paper scope → Task 7 step 2 (full frame list reproduced)
- §8 Deliverables → Task 1 (scaffold) + Tasks 4, 5, 7 (artifacts)
- §9 Risks → Task 3 (blocked handling), Task 8 step 2 (revise path with moodboard fallback)
- §10 Handoff → Task 9

**Placeholder scan:** No "TBD", no "add appropriate error handling", no "similar to Task N" without showing content. The synthesis content itself cannot be pre-written (it depends on findings that don't exist yet), but Task 5 step 2 specifies the exact structural template that IS pre-written.

**Type consistency:** The paths used across tasks are consistent (`docs/superpowers/research/facelift/{deezer,quran-com}/NN-<slug>.md` everywhere). The Paper scope list in Task 7 matches spec §7 verbatim. The brief slugs in Task 2's table match the filenames listed in the File Structure section.
