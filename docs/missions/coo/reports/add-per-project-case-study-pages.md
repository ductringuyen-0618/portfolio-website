# Report: Add per-project case study pages

## What shipped
- `src/pages/ProjectDetail.tsx`: a new page at `/projects/:id` rendering a project's full, untruncated description, complete technology list (no cap), full image gallery (reusing the existing `ImageLightbox` component), and links to `github`/`liveUrl` when present. Shows a "Project Not Found" state with a link back to `/projects` for an unknown/invalid id instead of crashing or rendering blank.
- `/projects/:id` route registered in `src/App.tsx`.
- `src/pages/Projects.tsx`: each card's title and a new "View case study" link now navigate to `/projects/${project.id}`. The existing screenshot lightbox trigger, search/filter behavior, and direct GitHub/Live Site/Video Demo links are unchanged.
- Styling follows the site's existing `card-elevated`, `section-padding`, `tag`, `btn-ghost`/`btn-primary` and earth-tone/dark-mode classes — no new colors, components, or layout patterns.

## Commits
- `feat: add per-project case study pages` (457768f)

## Validator findings (scrutiny pass — exact CI commands from `.github/workflows/deploy.yml`)
- `npm ci` — clean
- `npm run build` (`tsc -b && vite build`) — passes, no TypeScript errors
- Extra quality bar (defined in `package.json`, not wired into CI): `npm run lint` (0 errors, 3 pre-existing warnings unrelated to this change), `npx tsc -p tsconfig.app.json --noEmit` (clean), `npx vitest run` (128 passed, 3 skipped, all pre-existing)
- No new dependency added to `package.json`; no backend endpoint, CMS, or secret introduced.

## Reviewer notes (product pass)
- Verified in a real browser (desktop 1280px, mobile 390px, and dark mode) for a project with a full image gallery + live link (id 1, TechPulse AI) and for a project with no images and no live URL (id 4, AWS Bedrock Agent Integration) — the detail page degrades gracefully in both cases with no broken layout or empty sections.
- Verified the "Project Not Found" state renders correctly for an invalid id, and that clicking "View case study" from `/projects` navigates to the matching `/projects/:id`.
- Confirmed the `/projects` grid, its filters, and its own screenshot lightbox render unaffected.
- No horizontal scroll at mobile width; content reflows to a single column.

## CI
This repo's only workflow (`.github/workflows/deploy.yml`) triggers solely on `push` to `main`, not on pull requests. Confirmed via the GitHub API that PR #7 has zero check runs and zero commit statuses — nothing pending, nothing failing. The exact commands CI runs on `main` (`npm ci`, `npm run build`) were run locally against the PR's head commit (457768f) with clean results, as documented above.

## Links
- PR: https://github.com/ductringuyen-0618/portfolio-website/pull/7
- Decision issue: https://github.com/ductringuyen-0618/portfolio-website/issues/6
