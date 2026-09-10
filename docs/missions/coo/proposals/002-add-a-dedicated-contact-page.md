---
status: proposed
attempts: 0
branch: null
---
# Add a dedicated Contact page

## What you get
A real "Contact" page reachable from the same navigation bar as Home, Projects and About, instead of the current setup where the only way to reach out is three small text links buried in the footer. The page presents email, LinkedIn and GitHub as clear, individually clickable cards with icons, a one-click "copy email" button for people who don't have a mail client configured, and a direct link to download the resume that already lives at `public/resume.pdf`. It uses the same earth-tone palette, card styling and (once shipped) dark-mode classes as the rest of the site, so it reads as a natural fourth page rather than an afterthought.

## Why start this now
A portfolio site exists to get its owner hired or contacted, and right now the only path to that is three inline text links in the footer of every page — easy to miss, especially on mobile where the footer is below the fold and the links wrap into a tight row. A recruiter skimming the nav bar (Home / Projects / About) sees no "Contact" and may not scroll to the footer at all. This is a pure front-end change: no backend, no form service, no API keys, no new dependencies — everything it needs (email, LinkedIn, GitHub, resume file) already exists in the codebase today. Waiting costs real opportunities every time a visitor leaves without an obvious way to reach out; shipping it is a few hours of work reusing components and styles that already exist.

## Problem / opportunity
`src/App.tsx` only routes `/`, `/projects` and `/about`; `src/components/Layout/Header.tsx` only links to those three. The sole contact surface is `src/components/Layout/Footer.tsx`, three small `hover:text-earth-200` text links (Email, LinkedIn, GitHub) with no resume link and no visual weight. There is no dedicated place that makes "get in touch" the explicit point of the page.

## Proposed solution
- Add `src/pages/Contact.tsx`: a new page following the existing page structure (hero-style header section + content section, `section-padding`, `earth-*` gradient background, `.card`/`.card-elevated` classes already used in `Home.tsx`/`About.tsx`/`Projects.tsx`).
- Content: three contact method cards (Email, LinkedIn, GitHub) each with a `lucide-react` icon (already a dependency, already used elsewhere) and a clear call-to-action; a "Copy email" button using the Clipboard API with a brief "Copied!" confirmation state; a "Download resume" link/button pointing at the existing `public/resume.pdf`.
- Register the route: add `<Route path="contact" element={<Contact />} />` in `src/App.tsx` alongside the existing routes.
- Add a "Contact" link to `src/components/Layout/Header.tsx`'s nav (and, if there's a mobile nav variant in that file, there too) using the same `Link`/Tailwind classes as the existing Home/Projects/About links.
- Leave `Footer.tsx`'s existing links in place — the footer is a convenience on every page, the new page is the destination for people who came specifically to get in touch.
- If the in-flight dark mode work has already shipped by build time, give the new page matching `dark:` classes consistent with the rest of the site; if not, style it with the same light-only classes the other pages currently use so it's visually consistent with them at build time.

## Effort estimate
S — one new page component, one new route, one new nav link, reusing existing icons, styles and the existing resume asset. No new dependencies, no backend, no secrets.

## Validation contract
- Functional assertions:
  - `/contact` route renders the new Contact page.
  - Header nav includes a working "Contact" link on Home, Projects, About and Contact routes (renders from the shared Header, not a page-local copy).
  - The page renders an email contact method, a LinkedIn link, a GitHub link, and a resume download link/button, all pointing at the existing real values already used in `Footer.tsx`/`public/resume.pdf`.
  - The "Copy email" control copies the correct address to the clipboard and shows a confirmation state.
- Behavioral assertions:
  - Visual style (color palette, card/button classes, spacing) matches the existing Home/About/Projects pages — no ad hoc colors or layout patterns introduced.
  - Page is usable at mobile width (no horizontal scroll, nav and cards reflow sensibly).
  - LinkedIn and GitHub links open in a new tab with `rel="noopener noreferrer"`, matching the existing footer links' convention.
- Negative assertions (should NOT happen):
  - No new dependency added to `package.json`.
  - No backend endpoint, contact form submission service, or API key/secret introduced.
  - No regression to the existing Home/Projects/About pages or the footer's existing links.
  - No duplicate/second contact page or route.
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing, since they are defined in `package.json` even though not currently wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- This repo's only CI workflow (`deploy.yml`) runs `npm ci` and `npm run build` on push to `main` with no separate PR-time lint/type-check/test job; the validator should still run `lint`/`type-check`/`vitest` locally as a quality bar even though CI itself won't enforce them.
- If the in-flight dark-mode proposal (`001-add-a-dark-mode-toggle-to-the-portfolio-site`) has already merged by the time this is built, the new page should pick up matching `dark:` classes rather than shipping light-only and needing a follow-up pass.
- Out of scope: any real contact *form* that submits somewhere (would need a backend or a third-party form service and likely an API key/secret — explicitly excluded here), and any change to the footer's existing links.
