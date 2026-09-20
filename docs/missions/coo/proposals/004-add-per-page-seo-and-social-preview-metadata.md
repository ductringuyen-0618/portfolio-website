---
status: expired
attempts: 0
branch: null
---
# Add per-page SEO and social preview metadata

## What you get
Right now, every page on the site — the homepage, the projects grid, every individual project's case-study page, the About page, and the Contact page — shows the exact same browser tab title, the exact same search-engine description, and the exact same link-preview image and text when shared. After this ships, each page sets its own title, description, and share preview: a project's case-study page shows that project's name and one-line summary in the browser tab and in the preview card when the link is pasted into LinkedIn, Slack, or an email; About and Contact do the same for themselves.

## Why start this now
The site just shipped dedicated case-study pages (PR #7) specifically so a recruiter could be pointed at one project's full story instead of the generic homepage — but today, sharing `/projects/5` still shows "Duc Nguyen - Software Engineer Portfolio" everywhere the link is pasted or bookmarked, with zero mention of which project it is. That undercuts the exact payoff the case-study pages were built to deliver: a recruiter who bookmarks or forwards a specific project link, or finds it through a search engine, sees the wrong title, the wrong description, and no reason to click. The content to source this already exists in `src/data/projects.ts` (each project's `title` and `description`) and in the static copy already on About/Contact — this is a presentation gap, not new writing, which is what makes it cheap to close now while the case-study pages are still fresh.

## Problem / opportunity
`index.html` hardcodes one `<title>`, one `<meta name="description">`, and one set of Open Graph/Twitter tags for the whole app. Because this is a client-side-routed SPA, every route — `/`, `/projects`, `/projects/:id`, `/about`, `/contact` — inherits those same static tags for the life of the page load; nothing in `src/pages/*.tsx` ever updates `document.title` or any `<meta>` tag. A link to a specific project case study, About, or Contact page is indistinguishable from the homepage link in a browser tab, in a search result, or in a shared preview card.

## Proposed solution
- Add a small reusable hook, e.g. `src/hooks/useDocumentHead.ts`, that takes `{ title, description, image? }` and on mount sets `document.title` and updates (or temporarily inserts, then restores on unmount) the `content` of the existing `meta[name="description"]`, `meta[property="og:title"]`, `meta[property="og:description"]`, `meta[property="og:url"]`, `meta[name="twitter:title"]`, and `meta[name="twitter:description"]` tags already present in `index.html`. No new dependency (no `react-helmet`) — plain DOM APIs are enough for this scale.
- Call the hook from each page with page-appropriate copy:
  - `Home.tsx`: the existing default title/description (effectively a no-op, but keeps behavior consistent and resets state when navigating back).
  - `Projects.tsx`: a title like "Projects - Duc Nguyen" and a short description of the project list.
  - `ProjectDetail.tsx`: `${project.title} - Duc Nguyen` as the title and the project's own `description` (truncated to a reasonable meta-description length) as the description and og:description; reuse the project's own image for `og:image`/`twitter:image` when one exists, falling back to the site default otherwise.
  - `About.tsx` and `Contact.tsx`: a page-specific title/description pulled from their existing on-page copy.
- Update `og:url`/canonical-style values per page to the current path so shared links resolve to the right route when a crawler or chat app unfurls them.
- Leave `index.html`'s tags as the default/fallback values the hook restores to on unmount (e.g. when navigating away or hitting an unknown route).

## Effort estimate
S — one small hook with no external dependency, plus a one-line call added to each of the five existing page components using data that already exists (`project.title`, `project.description`, static About/Contact copy). No routing changes, no new pages, no backend.

## Validation contract
- Functional assertions:
  - Navigating to `/`, `/projects`, `/projects/:id` (for every project id in `src/data/projects.ts`), `/about`, and `/contact` each results in a distinct `document.title`.
  - `/projects/:id`'s title and meta description are derived from that specific project's `title`/`description`, not the generic site copy.
  - `meta[name="description"]`, `meta[property="og:title"]`, `meta[property="og:description"]`, and `meta[name="twitter:title"]`/`meta[name="twitter:description"]` update to match the active page.
  - Navigating away from a page (e.g. from a project detail page back to `/projects` or `/`) does not leave stale per-project title/description behind.
- Behavioral assertions:
  - No visual/layout change on any page — this is metadata-only.
  - Unknown/invalid `:id` on `ProjectDetail` still falls back gracefully (per the existing not-found handling from PR #7) with a sensible title, not a crash or blank tags.
  - Works the same in light and dark mode (metadata is theme-independent, but the change must not affect the theme-flash-prevention script in `index.html`).
- Negative assertions (should NOT happen):
  - No new dependency added to `package.json` (no `react-helmet`/`react-helmet-async`).
  - No backend endpoint, CMS, prerendering step, or API key/secret introduced.
  - No change to routing, to `src/data/projects.ts` content, or to any existing page's visible UI.
  - No regression to the existing theme-init or GitHub Pages SPA-redirect scripts in `index.html`.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- Because this is a pure client-side SPA with no server-side rendering or prerendering, crawlers/bots that don't execute JavaScript (some link-unfurlers) will still only ever see `index.html`'s static tags — this proposal improves the experience for users who navigate within the app (browser tab titles) and for any crawler/unfurler that does execute JS, but does not add server-side rendering, which is out of scope (much larger effort, not justified here).
- Meta description length for `ProjectDetail` needs a sensible truncation (e.g. ~155-160 characters) so it doesn't just dump the full case-study text into search results.
- Out of scope: a sitemap.xml, structured data/JSON-LD, or any change to the actual project copy.
