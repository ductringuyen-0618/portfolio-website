---
status: proposed
attempts: 0
branch: null
---
# Add live GitHub repo stats to project cards

## What you get
Every project card — on the homepage, on the `/projects` grid, and on each project's case-study page — gains a small live badge next to its GitHub link showing that repo's real star count and when it was last updated (e.g. "★ 3 · updated 2 days ago"), pulled directly from the actual repository at the moment the page loads.

## Why start this now
The site already makes strong claims ("production-ready", "enterprise systems", "50k+ TPS") backed only by static prose — nothing on the page proves the linked repos are real, current work rather than a one-time upload. TechPulse AI, Salon Hub, and the other featured projects are genuinely active repos; a live star count and "updated X ago" timestamp, sourced straight from the public GitHub API for the exact URLs already sitting in `src/data/projects.ts`, turns that claim into something a recruiter can verify in one glance, for the cost of a single unauthenticated API call per repo — no new service, no secret, no ongoing cost.

## Problem / opportunity
`src/data/projects.ts` already stores each project's `github` URL, but nothing on `Home.tsx`, `Projects.tsx`, or `ProjectDetail.tsx` shows any signal of that repo's real-world activity — the GitHub link is just a static outbound link. Visitors have no quick way to tell an actively maintained project from an abandoned one without leaving the site.

## Proposed solution
- Add a small hook, e.g. `src/hooks/useGithubRepoStats.ts`, that takes an `owner/repo` (parsed from `project.github`) and fetches `https://api.github.com/repos/{owner}/{repo}` (no auth, GET only), returning `{ stars, updatedAt }` or `null` on any failure.
- Cache each result in `sessionStorage` keyed by `owner/repo` so navigating between Home, Projects, and a case-study page during one visit does not refetch or burn extra unauthenticated rate-limit quota.
- Render a small badge (star icon + count, plus a relative time like "updated 3 days ago" via `Intl.RelativeTimeFormat`) next to the existing "Code" / GitHub link on: the featured cards in `Home.tsx`, the grid cards in `Projects.tsx`, and the header of `ProjectDetail.tsx`.
- When the fetch fails, is rate-limited (403), or the repo is 404 (private/renamed), render nothing extra — the existing GitHub link stays exactly as it is today, with no error message, placeholder, or layout jump.

## Effort estimate
S — one small fetch hook with sessionStorage caching, no new dependency, plus a one-line badge added to three existing components using data already present (`project.github`). No routing changes, no backend, no secrets.

## Validation contract
- Functional assertions:
  - On `Home.tsx`'s featured cards, `Projects.tsx`'s grid cards, and `ProjectDetail.tsx`, a project whose repo fetch succeeds shows a star-count + relative-updated-time badge next to its GitHub link.
  - The badge's numbers come from the specific repo in that project's own `github` URL, not a shared/global value.
  - Repeated navigation between pages in the same browser session does not trigger a new network request for a repo already fetched (verified via the sessionStorage cache key).
- Behavioral assertions:
  - A failed fetch (network error, 403 rate limit, 404) results in no badge and no visible error — the page renders exactly as it does today apart from the missing badge.
  - No loading spinner or layout shift is introduced while the badge is pending; it simply appears once data resolves, or never appears on failure.
  - Works the same in light and dark mode.
- Negative assertions (should NOT happen):
  - No new npm dependency added to `package.json`.
  - No GitHub token, API key, or secret introduced anywhere in the repo or CI.
  - No backend endpoint or server-side component added.
  - No change to existing project descriptions, tags, images, or routing.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- The unauthenticated GitHub API rate limit is 60 requests/hour per client IP; with ~5-6 projects and sessionStorage caching this is comfortable for a personal portfolio's normal traffic, but a burst of simultaneous visitors sharing one IP (e.g. behind a corporate NAT) could exhaust it — the silent-failure behavior above means this degrades gracefully rather than breaking anything.
- Requires the linked repositories to stay public; if one is made private the badge for that project simply stops appearing (same silent-failure path), it does not error.
- Out of scope: authenticated requests, GitHub Actions/CI badges, commit-graph visualizations, or any data beyond star count and last-updated time.
