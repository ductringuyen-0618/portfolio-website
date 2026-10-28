---
status: proposed
attempts: 0
branch: null
---
# Add clickable technology-tag filtering to the Projects page

## What you get
On the Projects page, every technology tag shown on a project card (React, AWS Bedrock, RAG, Spring Boot, etc.) becomes clickable. Clicking one instantly narrows the grid to only the projects that use it, and a small bar above the grid lists every technology across all projects so a visitor can jump straight to "show me everything you've built with X" without reading each card.

## Why start this now
A recruiter or hiring manager usually arrives with a specific stack in mind from the job posting they're matching you against ("do they have AWS experience? Spring Boot? RAG?"). Today the Projects page only filters by broad category (AI/ML, Full-Stack, Enterprise, Backend) and free-text search, and each card only shows the first 3 of up to 14 technologies with a "+N more" that hides the rest — so the exact skill a recruiter is scanning for is often invisible unless they open every case study. Letting them click a tag turns a 30-second skim into a direct answer, and it's a small addition on top of filtering logic that already exists in `src/pages/Projects.tsx`. The cost of waiting is recruiters leaving without ever discovering that a skill they needed is actually on the page, two or three tags deep in a "+N more".

## Problem / opportunity
`src/pages/Projects.tsx` already filters by `searchTerm` and `selectedCategory` (lines ~27-34), but nothing filters by `technologies`. Each card renders only `project.technologies.slice(0, 3)` plus a static "+N more" label (lines ~196-209) that is not interactive, so the majority of listed technologies across the 4 projects are effectively hidden from any filtering or discovery path.

## Proposed solution
- Add a `selectedTech` filter alongside the existing `selectedCategory` state in `src/pages/Projects.tsx`, and include it in the `filteredProjects` memo (a project matches when `selectedTech` is empty or included in `project.technologies`).
- Render a horizontal, wrapping bar of tag chips above the grid listing every unique technology across `projects` (deduplicated, alphabetically sorted), reusing the existing `tag`/`tag-gray` styling; clicking a chip sets `selectedTech` and highlights the active one, clicking it again clears the filter.
- Make each technology tag already shown on a project card (the visible slice, not the "+N more" label) clickable too, setting `selectedTech` to that tag so a visitor can filter straight from a card they're already looking at.
- When a filter yields zero projects, reuse the existing empty-state pattern already present for the search/category filters (if one exists) or add a simple "No projects use this technology yet — clear filter" message with a button that resets `selectedTech`.
- No new dependencies, no data model changes — `project.technologies: string[]` already has everything needed.

## Effort estimate
S — one file (`src/pages/Projects.tsx`) gets new state, a derived tag list, and a small chip bar; the filtering logic mirrors the existing category filter exactly, and tag rendering reuses existing `tag`/`tag-gray` classes.

## Validation contract
- Functional assertions:
  - A `selectedTech` state exists in `Projects.tsx` and is combined with `searchTerm`/`selectedCategory` in the filtering logic (AND semantics across all active filters).
  - A chip bar renders one chip per unique technology across all projects in `src/data/projects.ts`, with no duplicates.
  - Clicking a technology tag on a project card or in the chip bar sets `selectedTech` to that tag's exact string value.
- Behavioral assertions:
  - Clicking an already-selected tag/chip clears `selectedTech` back to showing all projects (toggle behavior), matching how `selectedCategory` already behaves if it has toggle behavior, or at minimum via a visible "clear filter" affordance.
  - Filtering is purely client-side state (`useState`/`useMemo`); no new network requests, no new dependencies in `package.json`.
  - The existing search box and category dropdown keep working unchanged and compose with the new tag filter (all three narrow the same list together).
- Negative assertions (should NOT happen):
  - No change to the `Project` type or to `src/data/projects.ts` data.
  - No new external API calls, no new secrets/env vars.
  - The "+N more" affordance on cards must not silently disappear without a way to see/filter by the hidden technologies (either make it clickable to reveal them, or ensure the chip bar above the grid already covers every technology so none are undiscoverable).
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, run at the repository root):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also covers typechecking)
  - Additionally run locally before pushing since they are configured in `package.json` even though not yet wired into CI: `npm run lint`, `npx vitest run`

## Risks / open questions
- With only 4 projects today, the tag bar could be fairly short-lived in usefulness until more projects are added — but it costs little to build and scales automatically as projects are added.
- Need to decide (left to the implementer, low-stakes) whether the tag bar should scroll horizontally or wrap to multiple lines on mobile; wrapping is simpler and matches the existing responsive card grid pattern.
