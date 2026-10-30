# Implementation Plan: French Translations

**Branch**: `002-french-translations` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

## Summary

Add a tiny, dependency-free i18n layer: typed message catalogues (`en`, `fr`), a `t()` /
`tp()` (plural) API through a React context, language detection + a remembered choice, and
localised craft data (tool sizes, part presets, sample projects). Domain code stops producing
English text: validation returns codes, and labels move from `domain/craft.ts` to the catalogues.

## Technical Context

**Language/Version**: TypeScript (strict) · **Primary Dependencies**: none added (no i18next etc.)

**Storage**: language choice in `localStorage` (per-device convenience; wrapped in try/catch).
Project data is unchanged: crafts and statuses are already stored as codes.

**Testing**: Vitest — catalogue parity test (same keys, same `{placeholders}`, no empty strings),
plural rules, a French UI flow, French first-launch samples. Completeness is also enforced at
compile time: `fr` is typed `Record<MessageKey, string>`.

## Research / Decisions

- **Own catalogue vs. i18next/FormatJS**: ~200 strings, 2 languages, simple plurals → a 60-line
  module is enough and keeps the "minimal dependencies" principle (constitution IV).
- **Plurals**: `Intl.PluralRules`-compatible categories `one`/`other`; French treats 0 and 1 as `one`.
- **Typography**: French strings use U+00A0 before `:` and U+202F before `?`/`!`, and « ».
- **Terminology**: rang (row), tour (round), mailles (stitches), taille d'aiguille / de crochet,
  monter les mailles (cast on), couleur repère (colour tag), mercerie (notions).

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I. Maker-First | One-tap language switch in header; craft terms natural in French | ✅ |
| II. Data Is Sacred | No data migration; switching never touches stored projects | ✅ |
| III. Accessible | `<html lang>` updated; all aria labels translated | ✅ |
| IV. Simple, Portable | No new dependency; domain stays React-free (returns codes) | ✅ |
| V. Tested Core | Parity, plural and French UI tests added | ✅ |

## Project Structure

```text
src/i18n/
├── lang.ts         # Lang type, detection, persistence, plural category
├── messages.ts     # en + fr catalogues (typed)
├── craftData.ts    # localised tool sizes and part presets
└── I18nProvider.tsx# context, useI18n(), t(), tp()
```

Changed: `src/domain/craft.ts` (labels removed), `src/domain/validation.ts` (error codes),
`src/domain/progress.ts` (summary text removed), `src/domain/sampleData.ts` (language param),
`src/storage/backup.ts` (error codes), every screen and UI component.
