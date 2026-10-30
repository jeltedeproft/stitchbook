# Stitchbook

A warm, mobile-first tracker for knitting, crochet and sewing projects. Split each project into
parts (body, sleeves, collar…), and for every part keep its row/round and stitch counts, needle or
hook size, colours (linked to the project's yarn) and notes.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from a phone on the same Wi-Fi
```

## Test and build

```bash
npm test         # unit, persistence and UI tests (Vitest + Testing Library)
npm run check    # type-check + tests
npm run build    # static site in dist/ — host anywhere (GitHub Pages, Netlify, a USB stick)
```

## Where data lives, and sharing between two people

- Projects are saved automatically in the browser's **IndexedDB on each device**. They survive
  closing and reopening the app, and nothing is uploaded.
- **No automatic sync yet.** Each person's projects live in their own browser. To share, go to
  *Your data* (the gear icon) → **Export** and send the file. When the other person **imports**
  it, new projects are added and, for projects you both have, the most recently changed one wins.
- If the browser blocks storage (some private windows), a warning banner says that changes will only
  last for that tab.
- Shared storage can be added later by implementing `ProjectRepository`
  (`src/storage/repository.ts`). The UI and domain code don't know where data lives.

## First launch

Three sample projects (labelled *Sample*) appear in an empty store, once only. Remove them from the
overview or the *Your data* page. They never come back, and they are never added to a store that
already has projects.

## Terminology

| You say | The app shows |
|---------|---------------|
| rank | **Row / Round** (chosen per part) |
| mailles | **Stitches** |
| needle / hook | **Needle size** (knitting), **Hook size** (crochet), **Needle / tool** (sewing, other) |

## Code map

```text
src/domain/    pure logic: types, counters, components, materials, validation, search, progress
src/storage/   ProjectRepository, IndexedDB + memory implementations, backup import/export
src/state/     store (load, persist, errors), first-launch seeding, toasts with undo
src/ui/        Counter, ComponentCard, ComponentEditor, MaterialsSection, Sheet, …
src/screens/   Overview, Project, ProjectForm, Settings
specs/001-craft-project-tracker/   Spec Kit spec, plan, research, data model, contracts, tasks
```

Built with React 19, TypeScript and Vite. The app has no runtime dependencies beyond React.
