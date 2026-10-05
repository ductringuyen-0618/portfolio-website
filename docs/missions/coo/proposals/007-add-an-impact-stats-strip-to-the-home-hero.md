---
status: proposed
attempts: 0
branch: null
---
# Add an "impact at a glance" stats strip to the Home hero

## What you get
The Home page hero gets a row of 4 scannable stat tiles — e.g. "50k+ daily transactions," "99.9% uptime," "10,000+ app downloads," "3 production systems shipped" — sitting right under the intro paragraph, before a visitor has to scroll or read anything. The same quantifiable numbers already exist today, buried in paragraphs of prose across Home, About and the skills list; this pulls them into one glanceable row.

## Why start this now
Recruiters and hiring managers skim portfolio sites for seconds before deciding whether to keep reading; right now every one of this candidate's hard numbers (50k+ TPS, 99.9% uptime, 10,000+ downloads) is locked inside dense paragraphs on the Home and About pages where a skimmer will miss them entirely. A stat strip is the fastest, lowest-risk way to put proof of real-world impact directly in front of the one audience this site exists to convince, and it costs nothing: the numbers are already written, already true, and already in the repo — this only changes how they're presented. Every fire this routine skips without shipping something is another day those numbers stay buried.

## Problem / opportunity
`src/pages/Home.tsx` hero section (lines ~30-96) is a headline, a paragraph, and two CTA buttons — no quantifiable proof of impact above the fold. The real numbers used to back up this candidate's experience are scattered as inline text in the hero paragraph ("99.9% uptime" appears only in `src/pages/About.tsx`'s skills list, "50k+ TPS" appears in `Home.tsx`'s skills array description, "10,000+ downloads" appears only in the About page experience entry for Bobaface). None of them are visually distinct or positioned where a time-pressed visitor will actually see them.

## Proposed solution
- Add a small `src/data/stats.ts` exporting a typed array of `{ value: string; label: string }` built only from numbers already stated elsewhere in the site's own content (no invented metrics): e.g. `50k+` / "Daily transactions handled", `99.9%` / "Production uptime", `10,000+` / "App downloads shipped", `3` / "Production systems built".
- Render them as a responsive 2x2 (mobile) / 1x4 (desktop) grid of stat tiles directly under the hero's CTA buttons in `src/pages/Home.tsx`, styled with the existing `card-elevated`/`text-gradient` utility classes so it matches current light/dark theming with no new CSS system and no new dependency.
- Keep the tiles purely presentational (no animation libraries beyond the `animate-fade-in-up` class already used elsewhere on the page).

## Effort estimate
S — one small data file and one new section inserted into the existing Home hero using components/classes already in the codebase. No routing changes, no new dependency, no backend, no secrets.

## Validation contract
- Functional assertions:
  - The Home page renders a stats strip of exactly 4 tiles, each showing a value and a label, positioned between the hero CTA buttons and the "What I Do" skills section.
  - Every stat value displayed is traceable to a number already present in the site's existing copy (About.tsx skills/experience, or Home.tsx's current skills array) — no fabricated metric is introduced.
- Behavioral assertions:
  - The strip lays out as a 2-column grid on narrow viewports and a 4-column row on desktop widths, with no horizontal overflow or layout shift.
  - Renders correctly and legibly in both light and dark mode using existing `card-elevated` / earth-palette classes.
  - Existing hero content (headline, intro paragraph, "View My Work"/"About Me" buttons) renders unchanged above the new strip.
- Negative assertions (should NOT happen):
  - No new npm dependency added to `package.json`.
  - No new backend endpoint, analytics call, or external service.
  - No change to any existing route, link destination, or the skills/experience content on the About page.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- Keep the four numbers honest and consistent with the prose that already states them elsewhere on the site; if a number ever changes in About.tsx, `stats.ts` should be updated to match rather than left to drift.
- Out of scope: animated count-up effects, pulling numbers from a live API/analytics source, or adding more than 4 tiles (keep the strip skimmable, not another wall of text).
