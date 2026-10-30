# Data Model: Craft Project Tracker

All ids are random strings. Timestamps are epoch milliseconds. Data is stored as one document per
project (materials and components embedded) — a project is the unit of save, sync and merge.

## Project

| Field | Type | Rules |
|-------|------|-------|
| id | string | required, unique |
| name | string | required, trimmed, 1–80 chars |
| craft | `knitting` \| `crochet` \| `sewing` \| `other` | required |
| status | `planned` \| `in_progress` \| `paused` \| `completed` | default `planned` |
| notes | string | optional, ≤ 5000 chars |
| photo | string (data URL) \| undefined | optional, image only |
| swatch | string (hex `#rrggbb`) | default picked from palette |
| archived | boolean | default false |
| isSample | boolean | true only for seeded samples |
| materials | Material[] | 0..n |
| components | Component[] | 0..n, array order = display order |
| lastComponentId | string \| undefined | component last counted |
| createdAt / updatedAt | number | `updatedAt` bumps on every change |

State transitions: any status → any status by user. `planned → in_progress` automatically on first
counter increment (FR-012). Archiving is orthogonal to status.

## Material

| Field | Type | Rules |
|-------|------|-------|
| id | string | required |
| name | string | required, 1–80 chars |
| brand, fiber, colorName, weight | string | optional, ≤ 80 chars |
| colorHex | string | optional `#rrggbb` |
| notes | string | optional, ≤ 1000 chars |

## Component

| Field | Type | Rules |
|-------|------|-------|
| id | string | required |
| name | string | required, 1–60 chars, duplicates allowed |
| status | `not_started` \| `in_progress` \| `complete` | default `not_started` |
| countUnit | `row` \| `round` | default `row` |
| rows | integer | 0–99 999 |
| targetRows | integer \| undefined | optional, 1–99 999 |
| stitches | integer | 0–99 999 |
| toolSize | string | optional, ≤ 40 chars |
| colors | ColorAssignment[] | 0..n |
| notes | string | optional, ≤ 2000 chars |
| countersEnabled | boolean | default true; false for sewing |

State transitions: `not_started → in_progress` automatically on first increment of either counter.

## ColorAssignment

| Field | Type | Rules |
|-------|------|-------|
| id | string | required |
| materialId | string \| undefined | references a Material in the same project |
| customName | string \| undefined | used when not linked |
| customHex | string \| undefined | `#rrggbb` |
| note | string | optional, ≤ 200 chars ("stripes every 4 rows") |

If `materialId` no longer resolves (material removed), UI shows "Removed material" + custom fields.

## AppMeta (separate store)

| Key | Value |
|-----|-------|
| `seeded` | true once sample data has been created or the store was non-empty at first launch |
| `schemaVersion` | 1 |

## Derived: progress

Component progress = 1 if `complete`; else `rows / targetRows` (clamped 0–1) if target set; else
0.5 if `in_progress`; else 0. Project progress = mean of component progress (or 1 if project
`completed`, 0 if no components).
