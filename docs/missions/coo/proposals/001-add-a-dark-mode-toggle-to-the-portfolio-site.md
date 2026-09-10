---
title: Add a dark mode toggle to the portfolio site
status: proposed
attempts: 0
branch: null
---
# Add a dark mode toggle to the portfolio site

# Add a dark mode toggle to the portfolio site

## What you get
A light/dark theme toggle in the site header, visible on every page (Home, About, Projects). On first visit it respects the visitor's OS preference (`prefers-color-scheme`), then remembers their explicit choice in `localStorage` across visits. All existing UI — the Home hero and skills grid, the About experience timeline, the Projects search/filter grid and image lightbox, and the Header/Footer — gets a matching dark palette, not just an inverted background.

## Why start this now
Tailwind CSS is already the site's styling layer, but its `dark:` variant and class-based dark mode strategy aren't wired up anywhere yet — `tailwind.config.js` has no `darkMode` setting, and no component uses `dark:` classes. This is exactly the kind of feature the current codebase makes cheap because the tooling is already installed and just unused. Dark mode is also one of the most commonly expected affordances on a 2026 developer portfolio, so it's a visible, low-risk win. Unlike the site's other big gap — the AI chat assistant, which is fully built but deliberately disabled (`AI_AGENT_ENABLED = false` in `src/components/Layout/Layout.tsx`) and carries real re-enablement risk (client-side LLM loading, bundle size, UX for model download) — dark mode needs no new dependencies, no backend, and no secrets.

## Problem
The site currently ships only a single light theme. Visitors who browse with an OS-level dark preference, or who simply prefer dark UIs, get no way to switch, and there is no persistence mechanism for a preference even if one existed. Tailwind's dark-mode support is installed but unconfigured, so none of the existing pages or components have a dark equivalent.

## Proposed solution
- Set `darkMode: 'class'` in `tailwind.config.js` so dark styling is driven by a class on `<html>` rather than the OS media query alone.
- Add a small theme hook/context (e.g. `src/context/ThemeContext.tsx`) that:
  - Reads `prefers-color-scheme` on first visit when no stored preference exists.
  - Persists the user's explicit choice to `localStorage` (e.g. key `theme`) and reads it back on subsequent visits, taking precedence over the OS preference.
  - Toggles a `dark` class on `document.documentElement`.
- Add a toggle button (sun/moon icon) to `src/components/Layout/Header.tsx`, wired to the theme context, present on every route since `Header` is rendered from the shared layout.
- Add `dark:` variant classes across `Home.tsx`, `About.tsx`, `Projects.tsx`, and `Layout.tsx`/Footer, covering backgrounds, text color, and card/surface colors, so every existing view (hero, skills grid, experience timeline, search/filter grid, image lightbox) has a matching dark palette rather than a naive inversion.

## Effort estimate
Small — no new dependencies, no backend or API changes; work is confined to one config file, one new context/hook, and `dark:` class additions across a handful of existing components.

## Validation contract
- Typecheck and lint pass with no new errors.
- `tailwind.config.js` has `darkMode: 'class'` set.
- Manual check: on first visit with OS set to dark, the site renders in dark mode by default; toggling to light and reloading keeps light (localStorage persistence verified); toggling to dark and reloading keeps dark.
- Manual check: the toggle is visible and functional from Home, About, and Projects routes (confirms it renders from the shared Header/Layout, not a page-local copy).
- Manual check: on each of Home, About, and Projects, no element is left with light-only background/text that becomes unreadable in dark mode (hero, skills grid, experience timeline, search/filter grid, lightbox all visually reviewed in both themes).
- No regression to existing light-mode appearance (visual diff/spot-check against current site).

## Risks
- Wiki/business-brain context for `portfolio-website` currently has no confirmed record of this repo's file structure or stack beyond what's stated in this request; the specific paths above (`tailwind.config.js`, `src/components/Layout/Header.tsx`, `Home.tsx`, `About.tsx`, `Projects.tsx`, `Layout.tsx`) are taken as given from the request description and should be verified against the actual repo at build time.
- Risk of inconsistent contrast/readability in dark mode if `dark:` classes are applied piecemeal rather than reviewed page-by-page.
- Out of scope: any visual redesign beyond a dark equivalent of the existing palette, the AI assistant re-enablement, the missing contact page, and SEO fixes (robots.txt/sitemap/per-route meta) — each is a separate, later proposal.
