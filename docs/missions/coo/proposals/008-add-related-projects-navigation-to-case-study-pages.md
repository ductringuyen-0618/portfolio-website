---
status: expired
attempts: 0
branch: null
---
# Add "keep exploring" project navigation to case study pages

## What you get
Every project case-study page gets a short strip at the bottom — "Previous / Next project" links plus two or three other project cards — so a visitor who lands on one project (from a shared link, a job application, or a search result) sees a clear, one-click path into the rest of the portfolio instead of hitting a dead end and leaving.

## Why start this now
Recruiters rarely start on the homepage — they follow a single link from a resume, a LinkedIn post, or a job application straight to one project's case study, and today that page ends at a row of screenshots with no next step except the browser's back button. Every project page is a dead end that depends on the visitor remembering to navigate back and dig further; that's the single highest-leverage missing path in the site, because it directly controls how much of the five showcased projects a time-pressed recruiter actually sees. The fix is pure navigation using data already in the repo — no new content, no new dependency — so the cost of shipping it is small and the cost of waiting is every visitor who sees one project and never finds the other four.

## Problem / opportunity
`src/pages/ProjectDetail.tsx` (142 lines) renders a single project's description, tech tags, and a screenshot grid, then stops — there is no link to any other project on the page. The only way back into the rest of the portfolio is the "Back to Projects" link at the very top, which a visitor who scrolled past the fold may not scroll back up to find. `src/data/projects.ts` already holds all five projects in a fixed array (`projects: Project[]`), including each one's `id`, `title`, `category`, `technologies`, and image, so everything this needs already exists.

## Proposed solution
- In `src/pages/ProjectDetail.tsx`, compute the previous and next projects by wrapping around the existing `projects` array order (so the last project's "Next" wraps to the first, and vice versa), skipping the current project itself.
- Add a "Keep exploring" section at the bottom of the page (below the Screenshots section) with:
  - A `Previous project` / `Next project` link pair, each showing the target project's title, matching the existing `btn-ghost`/`btn-secondary` styling already used elsewhere on the page.
  - 2 other projects (excluding the current one) rendered as compact cards reusing the same tag/thumbnail treatment already used for featured projects on `Home.tsx`, each linking to `/projects/:id`.
- No new data fields, no new dependency — this is pure navigation over the existing `projects` array via React Router `Link`.

## Effort estimate
S — one new section inside an existing page, derived entirely from data and components that already exist. No routing changes beyond links to existing routes, no new dependency, no backend, no secrets.

## Validation contract
- Functional assertions:
  - Every project's case-study page (`/projects/1` through `/projects/5`) renders a "Previous project" link and a "Next project" link, each pointing to a different, valid project route, with the sequence wrapping around at both ends.
  - The same page renders at least 2 other-project cards (never the current project), each linking to that project's own case-study page.
- Behavioral assertions:
  - The navigation strip renders correctly and legibly in both light and dark mode using existing earth-palette / `card-elevated` classes, with no horizontal overflow on mobile widths.
  - Clicking a Previous/Next link or another project's card navigates to that project's own case-study page and does not 404.
- Negative assertions (should NOT happen):
  - No new npm dependency added to `package.json`.
  - No change to the existing screenshot lightbox, tech-tag list, or action links (Code/Live Site) already on the page.
  - No change to `src/data/projects.ts` project content (titles, descriptions, images, tech lists stay exactly as they are).
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- Keep the "other projects" cards compact (title, category tag, one thumbnail) so the page doesn't balloon into a second Projects listing — the goal is a nudge forward, not a duplicate of `/projects`.
- Out of scope: a carousel/slider widget, view-count or "most viewed" ranking, or any change to which projects are marked `featured`.
