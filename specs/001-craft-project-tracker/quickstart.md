# Quickstart & Validation: Craft Project Tracker

## Prerequisites

Node.js 20+ and npm.

## Setup and run

```bash
npm install
npm run dev        # http://localhost:5173 (use --host to try it on a phone on the same Wi-Fi)
npm test           # unit + persistence + UI tests
npm run check      # type-check + tests
npm run build      # static build in dist/
```

## Validation scenarios

1. **First launch**: open in a fresh browser profile → 3 projects labelled "Sample" appear.
2. **Counters (US1)**: open "Sample · Harvest sweater" → on "Left sleeve" tap Rows + three times →
   reload → count kept. Tap − at 0 → button disabled, stays 0. Reset → Undo restores.
3. **Projects (US2)**: New project "Autumn socks", Knitting → appears as Planned, 0%. Search
   "merino" → only matching projects. Archive → Undo toast; "Archived" filter shows it.
4. **Components (US3)**: add "Cuff", "Leg", "Heel" → move "Heel" up → reload → order kept.
   Remove "Leg" → Undo restores it in place.
5. **Materials (US4)**: add a yarn with only a name → saved. Assign it as a component colour with
   a note → swatch + note shown on the component card.
6. **Backup (US5)**: Settings → Export → Import the same file → "0 added, 0 updated".
7. **Storage blocked**: in a private window that blocks IndexedDB → warning banner shown.
8. **Accessibility**: Tab through the overview and a project → every control shows a focus ring.
