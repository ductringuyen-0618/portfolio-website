---
status: in_progress
attempts: 0
branch: coo/add-per-project-case-study-pages
---
# Add per-project case study pages

## What you get
Each project card in the Projects grid currently shows a description truncated to three lines and only the first three technology tags before a "+N more" label — even though the full story (architecture decisions, tech stack, screenshots) already exists in the codebase. This ships a dedicated case-study page per project: clicking a card's title or a new "View case study" link opens `/projects/:id`, a full-width page with the complete, untruncated description, the entire technology list, the full image gallery, and direct links to the live demo and GitHub repo. The compact grid view on `/projects` stays exactly as it is today for browsing; the case-study page is where the depth lives.

## Why start this now
The richest, most differentiating content on the site — the actual explanation of what TechPulse AI's agentic research pipeline does, or how Salon Hub's row-level multi-tenancy works — is already written in full in `src/data/projects.ts`, but `src/pages/Projects.tsx` actively hides most of it behind `line-clamp-3` on the description and a "+N more" cutoff on technologies. A recruiter spends only seconds per project card; right now the site's own UI is the thing standing between that recruiter and the proof of work that would make them stop scrolling. This costs nothing to source — no new writing, no new screenshots, no new dependency — it's a presentation gap on data that already exists, which makes it unusually cheap to close relative to its payoff.

## Problem / opportunity
`src/pages/Projects.tsx` renders each `Project` (from `src/data/projects.ts`) inside a card with `<p className="... line-clamp-3">{project.description}</p>` and `project.technologies.slice(0, 3)` plus a "+N more" label for the rest. Clicking a project image opens `ImageLightbox` (just the screenshots, no text), and clicking through to GitHub/demo leaves the site entirely. There is no page on the site whose whole purpose is to tell one project's full story — the exact kind of "proof of work" a recruiter is looking for.

## Proposed solution
- Add `src/pages/ProjectDetail.tsx`: a new page that reads the project `id` from the route params, looks it up in `projects` from `src/data/projects.ts` (redirecting or showing a friendly not-found state to `/projects` if the id doesn't match), and renders the full, untruncated `description`, the complete `technologies` list (no cap), the full `images` gallery (reusing the existing `ImageLightbox` component for full-size viewing), and action buttons/links to `github` and `liveUrl`/`demo` — following the same `section-padding`, `card-elevated`, earth-tone and `dark:` classes already used on `Home.tsx`/`About.tsx`/`Projects.tsx`.
- Register the route in `src/App.tsx`: `<Route path="projects/:id" element={<ProjectDetail />} />` alongside the existing routes.
- In `src/pages/Projects.tsx`, make each card's title (and/or a new "View case study" link/button) a `Link` to `/projects/${project.id}`, while leaving the existing "View images" lightbox trigger and the direct GitHub/demo links on the card as they are today — the case-study page is an additional, deeper destination, not a replacement for the quick actions.
- Add a "Back to projects" link on the detail page.

## Effort estimate
S — one new page component reusing existing data, styles and the existing `ImageLightbox`; one new route; a couple of new links on the existing Projects grid. No new dependencies, no backend, no secrets.

## Validation contract
- Functional assertions:
  - `/projects/:id` renders the matching project's full (non-truncated) description and complete technology list for every project in `src/data/projects.ts`.
  - An invalid/unknown `:id` shows a graceful not-found state or redirects to `/projects`, and does not throw or render a blank page.
  - Each project card on `/projects` links to its own `/projects/:id` case-study page.
  - The case-study page renders the project's image gallery (when `images`/`image` exist) and links to `github` and, when present, `liveUrl`/`demo`.
- Behavioral assertions:
  - Visual style (palette, card classes, spacing, dark-mode classes) matches the existing Home/About/Projects/Contact pages — no ad hoc colors or layout patterns introduced.
  - Page is usable at mobile width (no horizontal scroll, content reflows to a single column).
  - The existing `/projects` grid view, its search/filter behavior, and its own lightbox/video-preview triggers are unchanged.
- Negative assertions (should NOT happen):
  - No new dependency added to `package.json`.
  - No backend endpoint, CMS, or API key/secret introduced.
  - No regression to the existing Home/About/Projects/Contact pages or routes.
  - No duplicate route or page for the same purpose.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- `Project.id` is a `number`; the route param will arrive as a string, so the lookup needs an explicit parse/compare rather than a strict `===` on mismatched types.
- Some projects have `images` (a gallery) while others may only have a single `image` or neither — the detail page should degrade gracefully (no gallery section) when no images exist, rather than assuming the richest case for every project.
- Out of scope: writing any new project copy or capturing new screenshots (this proposal only surfaces content that already exists), a blog or long-form case-study editor, and any contact-form backend.
