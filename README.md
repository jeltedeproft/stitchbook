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

## Languages: English and Français

The app opens in French when the browser prefers French, and in English otherwise. Switch any time
with the **FR / EN** button in the header or under *Your data → Language*. The choice is remembered
on that device. Switching never changes your data. Sample projects stay in the language they were
created in.

Strings live in `src/i18n/messages.ts`. `fr` is typed against `en`, so a missing French string
fails the type-check, and `tests/i18n/messages.test.ts` checks that placeholders and plurals match.
Write French with ordinary spaces: the no-break spaces before `:` `?` `!` and inside « » are added
automatically.

## Terminology

| You say | English | Français |
|---------|---------|----------|
| rank | **Row / Round** (chosen per part) | **Rang / Tour** |
| mailles | **Stitches** | **Mailles** |
| needle / hook | **Needle size**, **Hook size**, **Needle / tool** | **Taille d'aiguille**, **Taille de crochet**, **Aiguille / outil** |

## Put it on a phone

Every push to `main` builds the app and publishes it to GitHub Pages
(`.github/workflows/pages.yml`): **https://jeltedeproft.github.io/stitchbook/**

Open that link on the phone and add it to the home screen (iPhone: Safari → Share → *Add to Home
Screen*; Android: Chrome → ⋮ → *Install app*). On iPhone this also stops Safari from clearing the
app's data after a week without visits. Each phone keeps its own projects; share them with
*Your data → Export / Import*.

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
