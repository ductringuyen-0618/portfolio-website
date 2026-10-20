---
status: proposed
attempts: 0
branch: null
---
# Add structured Challenge / Approach / Impact sections to case study pages

## What you get
Every project case-study page stops being one dense paragraph of description and instead reads as a short, scannable story: what the project had to solve, how it was built, and what came out of it, each under its own clear heading. A recruiter skimming for ten seconds can now tell what you actually did on a project without reading a wall of text.

## Why start this now
Each case-study page today is a single run-on paragraph packing architecture, tech choices, and features into one block (`src/data/projects.ts` description fields run 300-500+ characters each). Recruiters and hiring managers scan, they don't read — a labeled Problem/Approach/Impact structure is one of the most repeated pieces of advice for technical portfolios because it lets a skimmer extract the "so what" in seconds instead of parsing a tech-tag-dense paragraph. The content already exists in the descriptions; this is purely restructuring what's already written into a format that gets actually read, so it's low-cost and the payoff compounds on every future project page too. The cost of waiting is every visitor who bounces off a wall of text before reaching the part that would have impressed them.

## Problem / opportunity
`src/data/projects.ts` stores one long `description` string per project, and `src/pages/ProjectDetail.tsx` (lines 63-66) renders it as a single `<p>`. There's no separation between what the project does, what the engineering challenge was, and what the measurable outcome was — everything is flattened into prose that a time-pressed reader has to parse in full to find the interesting part.

## Proposed solution
- Extend the `Project` interface in `src/data/projects.ts` with optional fields: `challenge?: string`, `approach?: string`, `impact?: string` (each a short 1-3 sentence string, derived entirely from facts already present in that project's existing `description`/`technologies` — no new claims invented).
- Fill in those three fields for all 4 existing projects, condensing/restructuring their current descriptions (e.g. for TechPulse AI: challenge = decomposing research questions and keeping a report cited and fast; approach = parallel subagents + RAG + SSE streaming stack already named; impact = live, deployed product with two distinct UI modes). Keep the original `description` field intact as a fallback.
- In `src/pages/ProjectDetail.tsx`, render three labeled subsections ("The Challenge", "The Approach", "The Outcome") in place of the single paragraph when a project has `challenge`/`approach`/`impact` set, reusing the existing `card-elevated` styling; fall back to rendering the plain `description` paragraph unchanged for any project missing the new fields (none currently, but keeps the component safe against future data entries).
- No new dependency, no new route, no layout framework change — same page, same card, restructured content.

## Effort estimate
S — content restructuring of 4 existing projects plus a small conditional render change in one existing page component. No new dependency, no backend, no secrets, no routing changes.

## Validation contract
- Functional assertions:
  - Each of the 4 project case-study pages (`/projects/1` through `/projects/4`) renders "The Challenge", "The Approach", and "The Outcome" as separate labeled sections instead of a single undifferentiated paragraph.
  - The content of each section is drawn only from facts already present in that project's existing `description`/`technologies` fields in `src/data/projects.ts` — no new, unverifiable claims.
- Behavioral assertions:
  - The new sections render correctly and legibly in both light and dark mode using existing earth-palette / `card-elevated` classes, with no horizontal overflow on mobile widths.
  - If a project has no `challenge`/`approach`/`impact` set, its page still renders the original `description` paragraph without error (graceful fallback).
- Negative assertions (should NOT happen):
  - No new npm dependency added to `package.json`.
  - No change to the existing screenshot lightbox, tech-tag list, or action links (Code/Live Site) already on the page.
  - No change to project titles, technologies, images, github/liveUrl links, or category values.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- Keep each section short (1-3 sentences) so the page doesn't grow much longer than today's single paragraph — the goal is scannability, not more total text.
- Out of scope: adding brand-new metrics or claims not already supported by the existing description/technologies data, a redesign of the case-study page layout, or changes to the Projects listing page.
