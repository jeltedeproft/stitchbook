# Research: Craft Project Tracker

## 1. Application platform

- **Decision**: Responsive single-page web app (React 19 + TypeScript + Vite).
- **Rationale**: The repo is empty with no deployment target; a web app runs on both friends'
  phones and computers with nothing to install, and can be added to the home screen. React is
  mainstream and maintainable; Vite gives a fast dev loop and a static build that can be hosted
  anywhere (GitHub Pages, Netlify) or opened locally.
- **Alternatives**: Native/Flutter app (needs store distribution, heavier); LibGDX (the author's
  game stack — wrong tool for forms-heavy UI); Svelte/Vue (fine, but React has the broadest
  ecosystem for future contributors).

## 2. Persistence and sharing between two people

- **Decision**: IndexedDB on each device behind a `ProjectRepository` interface, plus JSON
  export/import with last-updated-wins merge.
- **Rationale**: There is no backend, account system or hosting in this environment, and setting up
  auth + a hosted DB would add credentials and cost the user hasn't asked for. IndexedDB holds
  photos comfortably (localStorage caps at ~5 MB and is synchronous). The repository seam means a
  Supabase/Firebase/PocketBase or tiny REST implementation can be added later without UI changes;
  `updatedAt` on every project already supports conflict resolution.
- **Limitation (documented to users)**: Data does not sync automatically. Each person's data lives
  in their own browser; sharing is via export → send file → import.
- **Alternatives**: localStorage (too small for photos); a hosted DB now (needs accounts, secrets,
  and an ongoing service); CRDT sync libraries (overkill for two users).

## 3. Routing and state

- **Decision**: Hash-based router (`#/`, `#/project/:id`, `#/project/:id/edit`, `#/new`,
  `#/settings`) and a `useReducer`-free store: an in-memory `Project[]` held in React state, with
  every mutation going through a domain function, then `repository.save(project)`.
- **Rationale**: Four screens don't justify react-router; hash routing works when the build is
  opened from any static host without server rewrites.

## 4. Counter interaction on phones

- **Decision**: Large (56 px) − / + buttons beside a big tabular-numeral value, inline on each
  component card; tapping the value opens a small numeric input; long lists stay one tap away.
  Haptic tick via `navigator.vibrate(8)` where supported. Values announced via `aria-live="polite"`.
- **Rationale**: Matches physical row counters; minimal taps (SC-001).

## 5. Reordering

- **Decision**: Move up / move down icon buttons.
- **Rationale**: Drag-and-drop is fiddly on touch and inaccessible by keyboard without extra work.

## 6. Photos

- **Decision**: `<input type="file" accept="image/*">`, decode with `createImageBitmap`/`Image`,
  downscale on a canvas to max 1200 px, store as JPEG data URL (quality 0.82).
- **Rationale**: Keeps records < ~300 KB each and export files self-contained.

## 7. Tool sizes

- **Decision**: Free-text field with a craft-specific `<datalist>` of common sizes, e.g. knitting
  2.0–12 mm with US equivalents, crochet B-1 (2.25 mm)…N-15 (10 mm), sewing machine needles 70/10…110/18.
- **Rationale**: Covers metric, US, UK and odd sizes without a rigid picker.

## 8. Typography and palette

- **Decision**: "Fraunces" (soft serif display) for headings, "Nunito Sans" for body via Google
  Fonts with system fallbacks. Warm cream background, deep ink text, terracotta primary, sage and
  plum accents; dark mode via `prefers-color-scheme`.
- **Rationale**: Feels handmade and warm without being childish; both fonts are highly legible.

## 9. Testing tools

- **Decision**: Vitest (jsdom), Testing Library, fake-indexeddb.
- **Rationale**: Vitest shares Vite config; fake-indexeddb lets persistence tests exercise the real
  IndexedDB repository code.
