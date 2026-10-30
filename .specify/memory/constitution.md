<!--
Sync Impact Report
- Version change: template → 1.0.0 (initial ratification)
- Principles added: I. Maker-First Experience, II. Data Is Sacred, III. Accessible by Default,
  IV. Simple, Portable Architecture, V. Tested Core Behaviour
- Sections added: Technology & Quality Constraints, Development Workflow
- Removed sections: none
- Follow-up TODOs: none
-->

# Knit (Craft Project Tracker) Constitution

## Core Principles

### I. Maker-First Experience

The app exists to help makers pick up a project exactly where they left off.

- The most frequent actions (open a project, find a component, change a row or stitch count)
  MUST take no more than three taps from the project overview.
- Every screen MUST work on a 360px-wide phone without horizontal scrolling; touch targets for
  counters MUST be at least 44×44 CSS px.
- Terminology MUST match the craft (needle vs. hook, row vs. round); fields that do not apply to a
  craft (e.g. counters for sewing) MUST be skippable, never required.
- The visual language MUST be warm, calm and uncluttered; every list MUST have a designed empty state.

### II. Data Is Sacred

Users' craft records are irreplaceable.

- Every change MUST be persisted automatically; there is no "save" button to forget.
- Destructive actions (delete component, delete project, remove material, reset counter) MUST either
  ask for confirmation or offer an immediate undo.
- Counters MUST never go below zero.
- Sample data MUST only be created on a first launch with an empty store, MUST be clearly labelled,
  and MUST never overwrite or merge into real data.
- Persistence failures MUST be surfaced to the user, never swallowed.

### III. Accessible by Default

- Text and interactive elements MUST meet WCAG 2.1 AA contrast (4.5:1 body text, 3:1 large text and UI).
- Every control MUST be operable by keyboard with a clearly visible focus indicator.
- Every input and icon-only button MUST have an accessible name; live counter changes MUST be announced.
- Motion MUST respect `prefers-reduced-motion`.

### IV. Simple, Portable Architecture

- Domain logic (projects, components, counters, validation) MUST live in pure, framework-free modules.
- Storage MUST sit behind a repository interface so that shared/synced storage can be added later
  without touching UI or domain code.
- Runtime dependencies MUST be kept minimal; each new dependency needs a stated reason in the plan.

### V. Tested Core Behaviour

- Counter rules, component editing (create, rename, reorder, remove), validation and persistence
  round-trips MUST have automated tests.
- The build MUST pass type-checking and the full test suite before work is reported as done.

## Technology & Quality Constraints

- Delivered as a responsive web app that runs in current evergreen browsers (mobile and desktop).
- Data stays on the user's device unless the user explicitly exports it.
- Images MUST be downscaled before storage to keep the store small and fast.

## Development Workflow

- Work follows Spec Kit: constitution → spec → plan → tasks → implement.
- Changes are small and focused; the spec and plan are updated when behaviour changes.

## Governance

This constitution supersedes ad-hoc preferences for this repository. Amendments are made by editing
this file with a version bump (MAJOR: principle removed/redefined; MINOR: principle or section added;
PATCH: wording). Plans MUST include a Constitution Check, and any deviation MUST be justified in the
plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
