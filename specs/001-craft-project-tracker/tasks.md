---
description: "Task list for Craft Project Tracker"
---

# Tasks: Craft Project Tracker

**Input**: Design documents from `/specs/001-craft-project-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Requested by the brief (persistence, component editing, counters) and required by
constitution principle V.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Create Vite + React + TS project files: package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
- [x] T002 [P] Configure Vitest (jsdom, setup file with jest-dom + fake-indexeddb) in vite.config.ts and tests/setup.ts
- [x] T003 [P] Create design tokens and base styles (palette AA-checked, Fraunces/Nunito Sans, focus rings, reduced motion, dark mode) in src/styles/tokens.css and src/styles/base.css

## Phase 2: Foundational

- [x] T004 Define domain types (Project, Material, Component, ColorAssignment, enums) per data-model.md in src/domain/types.ts
- [x] T005 [P] Implement id generation and timestamps in src/domain/ids.ts
- [x] T006 [P] Implement craft labels ("Needle size"/"Hook size"/"Needle / tool"), status labels and tool-size suggestions in src/domain/craft.ts
- [x] T007 Implement validation + normalisation (name 1–80, component name 1–60, counts 0–99 999, hex `#rrggbb`) in src/domain/validation.ts
- [x] T008 Define ProjectRepository interface per contracts/repository.md in src/storage/repository.ts
- [x] T009 [P] Implement MemoryProjectRepository in src/storage/memoryRepository.ts
- [x] T010 Implement IndexedDbProjectRepository (db `knit`, stores `projects`, `meta`, ordered writes) in src/storage/indexedDbRepository.ts
- [x] T011 [P] Repository round-trip tests (save/load in new instance, remove, meta, ordering) in tests/storage/repository.test.ts
- [x] T012 Implement app store (load, loading/error states, mutate→persist, save-error banner, undo snapshots) in src/state/store.tsx and toast in src/state/toast.tsx
- [x] T013 Implement hash router in src/router.ts and app shell in src/App.tsx, src/main.tsx

## Phase 3: User Story 1 — Pick up and count (P1) 🎯 MVP

**Independent test**: open project, change counters, reload, counts kept; no negatives.

- [x] T014 [P] [US1] Counter rules: increment/decrement/set/reset with clamp 0–99 999 and auto status in src/domain/counters.ts
- [x] T015 [P] [US1] Unit tests for counters (no negatives, cap, set validation, auto in-progress) in tests/domain/counters.test.ts
- [x] T016 [US1] Counter UI (56 px −/+, tap-to-edit value, aria-live, reset with undo) in src/ui/Counter.tsx
- [x] T017 [US1] Component card with inline counters in src/ui/ComponentCard.tsx
- [x] T018 [US1] "Continue" card on overview using lastComponentId and scroll-to-component in src/screens/OverviewScreen.tsx and src/screens/ProjectScreen.tsx
- [x] T019 [US1] UI test: increment, decrement at 0 disabled, reset + undo, persisted after remount in tests/ui/counter.test.tsx

## Phase 4: User Story 2 — Overview & project CRUD (P1)

- [x] T020 [P] [US2] Project operations (create, update, archive/unarchive, delete) in src/domain/projects.ts
- [x] T021 [P] [US2] Search & filter (name/notes/materials, status, archived) in src/domain/search.ts
- [x] T022 [P] [US2] Progress calculation per data-model.md in src/domain/progress.ts
- [x] T023 [P] [US2] Unit tests for projects, search, progress in tests/domain/projects.test.ts
- [x] T024 [US2] Overview screen: cards (photo/swatch, craft, status, progress ring), search, status chips, archived toggle, empty states in src/screens/OverviewScreen.tsx and src/ui/ProjectCard.tsx
- [x] T025 [US2] Project form (create/edit; name required "1–80 chars"; craft; status; swatch) in src/screens/ProjectFormScreen.tsx
- [x] T026 [US2] Archive with undo, permanent delete with confirm dialog in src/ui/ConfirmDialog.tsx and src/screens/ProjectScreen.tsx
- [x] T027 [US2] UI test: create project, validation error, search, archive + undo in tests/ui/projects.test.tsx

## Phase 5: User Story 3 — Components (P1)

- [x] T028 [P] [US3] Component operations (add, rename/update, move up/down, remove + restore at index, colour assignments) in src/domain/components.ts
- [x] T029 [P] [US3] Unit tests for component editing and reorder bounds in tests/domain/components.test.ts
- [x] T030 [US3] Component editor sheet (name, unit row/round, target, tool size with datalist, colours linked to materials with note, notes, status, counters toggle) in src/ui/ComponentEditor.tsx
- [x] T031 [US3] Component list on project screen with add, reorder, remove+undo in src/screens/ProjectScreen.tsx
- [x] T032 [US3] UI test: add, rename, reorder, remove + undo, persisted in tests/ui/components.test.tsx

## Phase 6: User Story 4 — Details & materials (P2)

- [x] T033 [P] [US4] Material operations (add/update/remove + restore) in src/domain/materials.ts with tests in tests/domain/materials.test.ts
- [x] T034 [US4] Materials section + editor (name required, others optional) in src/ui/MaterialsSection.tsx
- [x] T035 [US4] Photo picker with downscale + type check in src/ui/PhotoPicker.tsx

## Phase 7: User Story 5 — Samples & backup (P3)

- [x] T036 [P] [US5] Sample data (3 projects, isSample) and seed-once logic in src/domain/sampleData.ts and src/state/store.tsx
- [x] T037 [P] [US5] Export/import with validation and last-updated-wins merge in src/storage/backup.ts
- [x] T038 [US5] Tests: seed only on empty store, never re-seed after removal, import merge + invalid file in tests/storage/backup.test.ts
- [x] T039 [US5] Settings screen: storage explanation, export, import, remove samples in src/screens/SettingsScreen.tsx

## Phase 8: Polish

- [x] T040 [P] README with setup/run/test and storage/sharing limitations in README.md
- [x] T041 [P] Web app manifest + icon in public/manifest.webmanifest and public/icon.svg
- [x] T042 Run `npm run check` and `npm run build`; fix issues
- [x] T043 Manual run-through of quickstart.md scenarios in a browser at phone and desktop widths

## Dependencies

Setup → Foundational → US1 ≈ US2 ≈ US3 (share ProjectScreen; implement in order) → US4 → US5 → Polish.
Domain tasks marked [P] in each story are independent of each other.

## Parallel examples

- US2: T020, T021, T022, T023 touch separate files.
- US5: T036 and T037 are independent.

## Implementation strategy

MVP = Phases 1–3 plus the minimum of US2/US3 needed to create a project with components; then
layer on materials, photos, samples and backup.
