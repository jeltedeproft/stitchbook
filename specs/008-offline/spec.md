# Feature Specification: Works Offline

**Feature Branch**: `008-offline`

**Created**: 2026-11-02

**Status**: Implemented

**Input**: User description: "can you implement that people can use it offline?"

## Acceptance Scenarios

1. After one visit with a connection, the app opens, counts, saves and navigates with no
   connection (projects were already stored on the device in IndexedDB).
2. On a weak signal the saved copy is shown after at most 3 seconds instead of a blank wait.
3. When online, a new deploy is used the next time the app is opened; the previous offline copy
   is deleted.
4. Fonts are saved once they have loaded; without them the app falls back to system fonts.
5. No new dependencies: a hand-written service worker (`public/sw.js`) plus a small Vite plugin
   that writes `precache.json` (every built file). Not registered in dev or tests.

## Verification

Headless Chrome, production preview: service worker active with all 9 files saved; with the network
switched off, reloading keeps the counter value, the counter still increments, and navigating to
Settings works.
