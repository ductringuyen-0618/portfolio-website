---
status: proposed
attempts: 0
branch: null
---
# Add a command palette (Cmd/Ctrl+K) quick navigator

## What you get
Pressing `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) anywhere on the site — or clicking a small "⌘K" button in the header — opens a searchable command palette. Typing filters a live list of every page (Home, About, Projects, Contact), every individual project's case-study, and quick actions (email, GitHub, LinkedIn, download resume); pressing Enter on a result jumps straight there.

## Why start this now
The site already brands itself around engineering craft ("enterprise systems," "production-ready"), but every interaction today still depends on scanning the header nav or scrolling the projects grid — nothing in the UI itself demonstrates frontend polish. A command palette is a well-known power-user affordance instantly recognizable from tools like Linear, GitHub, and VS Code; a technical reviewer who tries `Cmd+K` on a portfolio site and finds it wired up forms an impression in seconds that no amount of prose about "modern stack" can match. It costs nothing to build — every item it lists is data already in `src/data/projects.ts` and the existing routes/links in `Header.tsx` and `Contact.tsx` — no new dependency, no backend, no content to write.

## Problem / opportunity
`src/components/Layout/Header.tsx` only exposes a handful of links (Home, Projects, About, Contact, GitHub, LinkedIn, Resume) and there is no keyboard-first way to jump to a specific project's case-study page (`src/pages/ProjectDetail.tsx`) without first visiting `/projects` and scanning the grid. There is no global keyboard shortcut anywhere in the app.

## Proposed solution
- Add `src/components/CommandPalette.tsx`: a modal (`role="dialog"` `aria-modal="true"`) with a text input and a filtered, keyboard-navigable list combining: the four static routes, each entry from `projects` in `src/data/projects.ts` (title + category, linking to `/projects/{id}`), and a few quick actions reusing the exact links already in `Header.tsx` (GitHub, LinkedIn, Resume) and `src/pages/Contact.tsx` (email). Selecting an item calls `useNavigate()` from `react-router-dom` or opens the external link/`mailto:`, matching how those links already behave.
- Add a small hook, e.g. `src/hooks/useCommandPalette.ts`, registering a `keydown` listener for `Cmd+K`/`Ctrl+K` (with `preventDefault` so it doesn't fight the browser's own address-bar shortcut) to toggle the palette, `Escape` to close it, and `ArrowUp`/`ArrowDown`/`Enter` to move through and select results. Mount it once in `src/components/Layout/Layout.tsx` so it's available on every page.
- Add a small "⌘K" trigger button next to the existing Resume/theme controls in `Header.tsx` for visitors without a keyboard (mobile, trackpad-only) or who don't know the shortcut.
- Use the `lucide-react` icons and Tailwind utility classes already used throughout the codebase (e.g. `card-elevated`, `input-field`) so the palette matches existing light/dark styling with no new CSS system.
- On close, restore focus to whatever element had focus before the palette opened.

## Effort estimate
S — one modal component, one keydown hook, one header button, and a static list built entirely from data and links that already exist. No routing changes, no backend, no secrets, no new dependency.

## Validation contract
- Functional assertions:
  - Pressing `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) from any route opens the palette; pressing it again or `Escape` closes it.
  - Typing in the palette's input filters the combined list (pages, projects, quick actions) by title/label in real time.
  - Pressing `Enter` on the highlighted result, or clicking a result, navigates to the corresponding route (via `react-router-dom`) or opens the corresponding external link/`mailto:` exactly as the existing header/contact links do.
  - The "⌘K" header button opens the same palette as the keyboard shortcut.
- Behavioral assertions:
  - The palette is fully operable by keyboard alone: `ArrowUp`/`ArrowDown` move the highlighted result, `Enter` selects it, `Escape` closes without navigating.
  - Closing the palette (via `Escape`, backdrop click, or selection) returns keyboard focus to the element that had focus before it opened.
  - Renders correctly and legibly in both light and dark mode, matching existing `card-elevated`/`input-field` styling.
  - The global keydown listener does not fire while an existing text input/textarea (e.g. the AI assistant's chat box) has focus, so it never hijacks normal typing.
- Negative assertions (should NOT happen):
  - No new npm dependency added to `package.json`.
  - No new backend endpoint, analytics call, or external service.
  - No change to the destinations or behavior of the existing header nav links, GitHub/LinkedIn/Resume links, or contact email — the palette only reuses them.
  - The site's existing pages render identically when the palette is closed (no layout shift, no persistent overlay).
- Test commands the build will need to pass (from `.github/workflows/deploy.yml`, the only CI workflow in this repo, which runs on push to `main`):
  - `npm ci`
  - `npm run build` (runs `tsc -b && vite build`, so this also gates TypeScript compilation)
  - Also run locally before pushing as a quality bar, since they are defined in `package.json` but not wired into CI: `npm run lint`, `npm run type-check`, `npx vitest run`.

## Risks / open questions
- `Ctrl+K` focuses the address bar in some browsers (notably Firefox) unless `preventDefault()` is called on the `keydown` handler; this is a standard, well-documented pattern (the same one Linear/GitHub use) and must be implemented carefully so it doesn't break browser defaults for other shortcuts.
- The AI assistant widget (`AgentWidget.ts`/`AgentDemo.tsx`) is also an overlay; the palette needs its own stacking context (`z-index`) so the two never visually collide, and the keydown listener must not fire while the assistant's own input is focused.
- Out of scope: fuzzy/typo-tolerant search (simple substring filtering is enough for this data set size), command history, or any server-backed search index.
