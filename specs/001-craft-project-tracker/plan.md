# Implementation Plan: Craft Project Tracker

**Branch**: `001-craft-project-tracker` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-craft-project-tracker/spec.md`

## Summary

A mobile-first, single-page web app for tracking knitting, crochet and sewing projects. Projects own
materials and components; components own row/round and stitch counters, tool size, colours, notes
and status. All logic for counters, components and validation lives in pure TypeScript modules.
Data is persisted locally in the browser's IndexedDB behind a `ProjectRepository` interface so a
shared/synced backend can be slotted in later; JSON export/import gives a manual sharing path now.

## Technical Context

**Language/Version**: TypeScript (strict), ES2022 target

**Primary Dependencies**: React 19 (UI), Vite (dev server/build). No router, state or UI libraries:
a ~40-line hash router and a reducer-based store cover the needs.

**Storage**: IndexedDB (one object store for projects, one for app metadata), wrapped by
`IndexedDbProjectRepository`; in-memory repository as fallback and for tests.

**Testing**: Vitest + jsdom, React Testing Library + user-event, fake-indexeddb for persistence tests.

**Target Platform**: Evergreen mobile and desktop browsers (Safari iOS 16+, Chrome, Firefox, Edge).

**Project Type**: Single-page web application (frontend only).

**Performance Goals**: Counter taps reflect instantly (<16 ms render); writes complete < 50 ms.

**Constraints**: Works offline after load; photos downscaled to ≤ 1200 px JPEG; no server.

**Scale/Scope**: 2 users, ~tens of projects each, ~5–20 components per project, 4 screens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How the design complies | Status |
|-----------|------------------------|--------|
| I. Maker-First | Counters inline on component cards (open project → tap +); 56 px buttons; craft-aware labels; sewing hides counters by default | ✅ |
| II. Data Is Sacred | Auto-persist on every change; undo toasts for remove/archive/reset; confirm dialog for permanent delete; `clampCount` in domain; samples only when meta flag absent; save errors shown in banner | ✅ |
| III. Accessible | Tokens checked for AA; `:focus-visible` rings; labelled inputs; `aria-live` counter values; reduced-motion media query | ✅ |
| IV. Simple, Portable | `src/domain` is React-free; `ProjectRepository` interface; runtime deps = react + react-dom only | ✅ |
| V. Tested Core | Unit tests for counters/components/validation; repository round-trip tests; UI tests for counter and component flows | ✅ |

Post-design re-check: still passing; no violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/001-craft-project-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── repository.md     # storage interface (sync-ready seam)
│   └── export-format.md  # backup / sharing file format
└── tasks.md
```

### Source Code (repository root)

```text
index.html
src/
├── main.tsx                # entry
├── App.tsx                 # shell, routing, banners
├── router.ts               # hash router hook
├── styles/                 # tokens.css, base.css, components.css
├── domain/                 # pure logic, no React
│   ├── types.ts
│   ├── ids.ts
│   ├── counters.ts
│   ├── components.ts
│   ├── projects.ts
│   ├── materials.ts
│   ├── craft.ts            # craft labels, tool sizes
│   ├── validation.ts
│   ├── search.ts
│   ├── progress.ts
│   └── sampleData.ts
├── storage/
│   ├── repository.ts       # ProjectRepository interface
│   ├── memoryRepository.ts
│   ├── indexedDbRepository.ts
│   └── backup.ts           # export / import + merge
├── state/
│   ├── store.tsx           # context, actions, persistence, undo
│   └── toast.tsx
├── ui/                     # reusable presentational components
└── screens/
    ├── OverviewScreen.tsx
    ├── ProjectScreen.tsx
    ├── ProjectFormScreen.tsx
    └── SettingsScreen.tsx
tests/
├── domain/
├── storage/
└── ui/
```

**Structure Decision**: Single frontend project. Domain → storage → state → UI layering, with
imports flowing only downward. Tests mirror the source folders.

## Complexity Tracking

No constitution violations.
